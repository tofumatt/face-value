#!/bin/bash

lang=$1

echo $lang

mkdir -p locales/$lang/LC_MESSAGES/
msginit --locale=$lang --input=locales/templates/LC_MESSAGES/messages.pot --output=locales/$lang/LC_MESSAGES/messages.po
