import os
import sys
import json
from hashlib import sha1
from glob import iglob

from lxml import etree
from lxml.html import XHTMLParser
from lxml.builder import E

SCRIPTS_ROOT = os.path.dirname(__file__)
DESMOS_ROOT = os.path.realpath(os.path.join(SCRIPTS_ROOT, ".."))
MODULES_ROOT = os.path.realpath(
    os.path.join(SCRIPTS_ROOT, "..", "..", "..", "modules")
)


def main():
    for module in iglob(os.path.join(MODULES_ROOT, "*", "index.cnxml")):
        tree = etree.parse(module, XHTMLParser(recover=True))
        replacements = []
        for element in tree.xpath(
            '//*[contains(@class, "os-raise-ib-desmos-gc")]'
        ):
            initializer = {
                k: v
                for k, v in {
                    "disableExpressions": element.get(
                        "data-disable-expressions"
                    )
                    is not None,
                    "width": element.get("data-width"),
                    "height": element.get("data-height"),
                    "equations": element.get("data-equations"),
                    "scaleTop": element.get("data-top"),
                    "scaleBottom": element.get("data-bottom"),
                    "scaleRight": element.get("data-right"),
                    "scaleLeft": element.get("data-left"),
                    "tables": element.get("data-tables"),
                }.items()
                if v is not None
            }
            initializer_string = json.dumps(initializer, separators=(",", ":"))
            initializer_hash = sha1(initializer_string.encode()).hexdigest()
            if os.path.exists(
                os.path.join(DESMOS_ROOT, f"{initializer_hash}.js")
            ):
                iframe = E.iframe(
                    src=f"../../media/desmos/{initializer_hash}.html",
                    width=initializer.get("width", "500"),
                    height=initializer.get("height", "400"),
                )
                element.getparent().replace(element, iframe)
                replacements.append(element.sourceline)
            else:
                print(
                    "[WARNING] Could not find replacement for element at "
                    f"{module}:{element.sourceline}\n"
                    f"initializer: {initializer_string}\n"
                    f"hash: {initializer_hash}",
                    file=sys.stderr,
                )
        if replacements:
            for line_modified in replacements:
                print(f"{module}:{line_modified}")
            tree.write(module, encoding="utf-8")


if __name__ == "__main__":
    main()
