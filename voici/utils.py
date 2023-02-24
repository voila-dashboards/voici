#############################################################################
# Copyright (c) 2018, Voilà Contributors                                    #
# Copyright (c) 2018, QuantStack                                            #
#                                                                           #
# Distributed under the terms of the BSD 3-Clause License.                  #
#                                                                           #
# The full license is in the file LICENSE, distributed with this software.  #
#############################################################################

import datetime
import json
import os
from typing import List, Tuple

from jupyter_core.paths import jupyter_path

from nbconvert.exporters.html import find_lab_theme


def find_all_lab_theme() -> List[Tuple[str, str]]:
    labextensions_path = jupyter_path("labextensions")
    roots = tuple(
        os.path.abspath(os.path.expanduser(p)) + os.sep for p in labextensions_path
    )
    theme_list = []
    for root in roots:
        if os.path.exists(root):
            for ex in os.listdir(root):
                try:
                    theme_list.append(find_lab_theme(ex))
                except Exception:
                    pass

    return theme_list


class DateTimeEncoder(json.JSONEncoder):
    """A custom date-aware JSON encoder"""

    def default(self, o):
        if isinstance(o, datetime.datetime):
            return o.isoformat().replace("+00:00", "Z")

        return json.JSONEncoder.default(self, o)
