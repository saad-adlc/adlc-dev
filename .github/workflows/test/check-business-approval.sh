#!/usr/bin/env bash
set -uo pipefail
F=.github/workflows/adlc-business-approval.yml
ruby -ryaml -e '
  d = YAML.safe_load(File.read(ARGV[0], encoding:"UTF-8"), aliases:true)
  on = d["on"] || d[true]
  raise "no pull_request trigger" unless on["pull_request"]
  t = on["pull_request"]["types"]
  %w[opened synchronize reopened labeled unlabeled].each { |x| raise "missing type #{x}" unless t.include?(x) }
  j = d["jobs"].values.first
  perms = (d["permissions"]||{}).merge(j["permissions"]||{})
  raise "needs statuses: write" unless perms["statuses"] == "write"
  puts "OK adlc-business-approval.yml: pull_request types ok; statuses:write present"
' "$F"
grep -q "adlc/business-approval" "$F" || { echo "FAIL: missing status context adlc/business-approval"; exit 1; }
grep -q "adlc-approved" "$F" || { echo "FAIL: does not consume adlc-approved label"; exit 1; }
echo "business-approval checks pass"
