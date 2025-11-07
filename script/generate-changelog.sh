#!/bin/bash

# Get the latest 10 commits excluding those starting with "release:"
echo "## 更新"
echo ""
git log --oneline -20 --pretty=format:"%s" | grep -v "^release:" | head -10 | while read -r line; do
    echo "- $line"
done
