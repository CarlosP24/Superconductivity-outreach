#!/bin/sh
# Build the talk.
#   sh build.sh           figures + standalone deck (one self-contained HTML) + preview deck
#   sh build.sh publish   also copy the standalone deck to PUBLISH_DIR/PUBLISH_NAME
# Run it through sh: Nextcloud sync does not keep the executable bit.
# Data for interactive figures (assets/data) come from julia/export_data.jl; rerun that only
# when the underlying results change.
set -e
cd "$(dirname "$0")"

TALK=talk                 # talk.qmd
PUBLISH_DIR=""            # e.g. ../../../Presentations/2027_03_Event (relative to this folder)
PUBLISH_NAME=""           # e.g. Topic_Event.html

# Static figures copied in from elsewhere (paper figures, cartoons), if the talk has any
if [ -f collect_figs.sh ]; then sh collect_figs.sh; fi

# The standalone render removes $TALK_files/, so it goes first.
quarto render "$TALK.qmd" -M embed-resources:true -o "$TALK-standalone.html"
quarto render "$TALK.qmd"
echo "$TALK-standalone.html: $(du -h "$TALK-standalone.html" | cut -f1)"

if [ "$1" = "publish" ]; then
  if [ -z "$PUBLISH_DIR" ] || [ -z "$PUBLISH_NAME" ]; then
    echo "set PUBLISH_DIR and PUBLISH_NAME at the top of build.sh" >&2; exit 1
  fi
  mkdir -p "$PUBLISH_DIR"
  cp "$TALK-standalone.html" "$PUBLISH_DIR/$PUBLISH_NAME"
  echo "copied to $PUBLISH_DIR/$PUBLISH_NAME"
fi
