"""MkDocs hook: draw a diagram of each design pattern from the pattern page's own tables.

For every page docs/odp/odp-NNN.md, the classes table (label and parent), the correlative column
(ODP-003), and the relations table (domain and range, or failing those the "A relation between
an X and a Y" wording of the definition) are turned into a Mermaid diagram, inserted under the
Solution heading before the tables. Nothing is written to the page files: the diagram is rebuilt
from the tables on every build, so it always matches them.
"""
import re

PAGE = re.compile(r"(^|/)odp/odp-\d+\.md$")
ARTICLES = re.compile(r"^(?:a|an|the|some|two|another|an earlier|earlier)\s+", re.I)
STOP = re.compile(r",|\.|;| whose | through | in virtue | that | toward | during | over which | held by | by which | in which | from which ", re.I)
BFO = {"entity", "continuant", "occurrent", "independent continuant", "material entity", "process",
       "generically dependent continuant", "specifically dependent continuant", "realizable entity",
       "role", "disposition", "quality", "temporal region"}


def _cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def _clean(text):
    text = re.sub(r"\(alt\..*?\)", "", text)
    text = re.sub(r"[*_`]", "", text)
    text = text.replace("(defined here)", "").replace("(defined)", "")
    text = re.sub(r"^(ODP-\d+|BFO)\s+", "", text.strip())
    return re.sub(r"\s+", " ", text).strip()


def _tables(md):
    """Yield (heading, header cells, rows) for each table under a ### heading."""
    heading, header, rows = None, None, []
    for line in md.splitlines() + [""]:
        if line.startswith("#"):
            heading = line.lstrip("#").strip().lower()
        if line.lstrip().startswith("|"):
            cells = _cells(line)
            if header is None:
                header = [c.lower() for c in cells]
            elif not set("".join(cells)) <= set("-: "):
                rows.append(cells)
        elif header is not None:
            yield heading, header, rows
            header, rows = None, []


def _pick(segment, labels):
    seg = ARTICLES.sub("", _clean(segment)).lower()
    for lab in sorted(labels, key=len, reverse=True):
        if re.search(r"\b" + re.escape(lab.lower()) + r"s?\b", seg):
            return lab
    return seg.rstrip("s") if seg.endswith("ns") else seg


def _from_definition(defn, labels):
    text = _clean(defn)
    m = re.search(r"between two (.+?)(?: held| that|,|\.)", text, re.I)      # symmetric: a loop
    if m:
        one = _pick(m.group(1), labels)
        return one, one
    m = re.search(r"between (.+?) and (.+)", text, re.I)
    if m:
        return _pick(m.group(1), labels), _pick(STOP.split(m.group(2))[0], labels)
    return None


def build(md):
    classes, parents, correl, rels = [], {}, set(), []
    for heading, header, rows in _tables(md):
        if heading == "classes" and "label" in header:
            pcol = next((i for i, h in enumerate(header) if "parent" in h), None)
            ccol = header.index("correlative") if "correlative" in header else None
            for r in rows:
                lab = _clean(r[0])
                classes.append(lab)
                if pcol is not None and pcol < len(r) and "decision" not in r[pcol].lower():
                    parents[lab] = _clean(r[pcol])
                if ccol is not None and ccol < len(r) and r[ccol].strip():
                    correl.add(tuple(sorted((lab, _clean(r[ccol])))))
        elif heading == "relations" and "label" in header:
            dcol = header.index("domain") if "domain" in header else None
            rcol = header.index("range") if "range" in header else None
            fcol = header.index("definition") if "definition" in header else len(header) - 1
            for r in rows:
                defn = r[fcol] if fcol < len(r) else ""
                if defn.lower().startswith("inverse of"):
                    continue
                if dcol is not None:
                    dom, rng = _clean(r[dcol]), _clean(r[rcol])
                    rng = "entity" if rng in ("(any)", "any", "") else rng
                    rels.append((_clean(r[0]), dom, rng))
                else:
                    ends = _from_definition(defn, classes + ["person or organization", "legal content", "legal act"])
                    if ends:
                        rels.append((_clean(r[0]), ends[0], ends[1]))
    if not classes:
        return None

    # Resolve abbreviated parents ("first-order" -> "first-order legal position").
    def resolve(name):
        if name in classes:
            return name
        hit = [c for c in classes if c.startswith(name + " ")]
        return hit[0] if len(hit) == 1 else name

    ids, lines, ext = {}, ["flowchart BT"], set()

    def node(name):
        if name not in ids:
            ids[name] = f"n{len(ids)}"
            shape = f'["{name}"]' if name in classes else f'("{name}")'
            lines.append(f"  {ids[name]}{shape}")
            if name not in classes:
                ext.add(ids[name])
        return ids[name]

    for c in classes:
        node(c)
    for c, p in parents.items():
        lines.append(f"  {node(c)} -->|is a| {node(resolve(p))}")
    for a, b in sorted(correl):
        if a in classes and b in classes:
            lines.append(f"  {node(a)} <-.->|correlative| {node(b)}")
    for lab, d, r in rels:
        lines.append(f"  {node(resolve(d))} -. {lab} .-> {node(resolve(r))}")
    lines.append("  classDef ext stroke-dasharray: 4 3,opacity:0.8")
    if ext:
        lines.append("  class " + ",".join(sorted(ext, key=lambda x: int(x[1:]))) + " ext")
    return "\n".join(lines)


def on_page_markdown(markdown, page, config, files):
    if not PAGE.search(page.file.src_uri):
        return markdown
    diagram = build(markdown)
    if not diagram:
        return markdown
    block = ("### Diagram\n\n```mermaid\n" + diagram + "\n```\n\n"
             "*Solid boxes are this pattern's classes; dashed boxes are classes from BFO or other patterns. "
             "Solid arrows mean **is a**; dotted arrows are relations, from domain to range. Drawn "
             "automatically from the tables below, so it always matches them.*\n\n")
    return re.sub(r"(?m)^### Classes", lambda m: block + m.group(0), markdown, count=1)
