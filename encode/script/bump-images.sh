#!/usr/bin/env bash
# bump-images.sh — pull :latest for selected images, re-tag as <prefix>.YYYY.MM.DD.HH.mm,
# and point the matching *_IMAGE var in an env file at the new tag.
#
# Generic on purpose: no hardcoded repo path, prefix, or filenames — works on
# any host whose env file follows the same convention (one `VAR_IMAGE=repo:tag`
# line per service; old tags optionally kept below as `#VAR_IMAGE=...` history).
# Meant to be dropped standalone on a prod host (e.g. pulled from R2) and run
# from that host's compose project directory.
#
# The old tag is never lost:
#   - the pulled image is only tagged, never removed -> old image stays on disk
#   - the previous active line is kept as a `#VAR=...` comment right below the
#     new one (same history-as-comments layout most of these env files already use)
#   - the whole env file is copied to <file>.bak-imagebump-<timestamp> first
#
# Usage:
#   ./bump-images.sh [options] [env-file]
#
# Options:
#   -e, --env-file PATH   env file to update (default: ./.env, else <script-dir>/../.env)
#   -p, --prefix STR      tag prefix; skips the interactive prompt
#   -s, --select LIST     indices to bump, space/comma separated, or "all"; skips the menu
#   -y, --yes             skip the confirmation prompt (needed for non-interactive runs)
#   -h, --help            show this help
#
# Examples:
#   ./bump-images.sh                                  # fully interactive, ./.env
#   ./bump-images.sh /srv/prod-hcm/.env
#   ./bump-images.sh -e /srv/prod-hcm/.env -p hcm -s all -y   # non-interactive
#
# This only pulls/tags/rewrites the env file. It does NOT run `docker compose
# up` — that stays a manual step (or your prod's own rollout script), since the
# safe deploy order/downtime tradeoffs differ per service and per host.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() { sed -n '2,34p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; }

ENV_FILE=""
PREFIX=""
SELECT=""
ASSUME_YES=0
POSITIONAL=""

while [ $# -gt 0 ]; do
  case "$1" in
    -e|--env-file) ENV_FILE="$2"; shift 2 ;;
    -p|--prefix) PREFIX="$2"; shift 2 ;;
    -s|--select) SELECT="$2"; shift 2 ;;
    -y|--yes) ASSUME_YES=1; shift ;;
    -h|--help) usage; exit 0 ;;
    --) shift; POSITIONAL="${1:-}"; shift $#; ;;
    -*) echo "!! tuỳ chọn không hợp lệ: $1" >&2; usage >&2; exit 1 ;;
    *) POSITIONAL="$1"; shift ;;
  esac
done

if [ -z "$ENV_FILE" ]; then
  if [ -n "$POSITIONAL" ]; then
    ENV_FILE="$POSITIONAL"
  elif [ -f "./.env" ]; then
    ENV_FILE="./.env"
  elif [ -f "$SCRIPT_DIR/../.env" ]; then
    ENV_FILE="$SCRIPT_DIR/../.env"
  else
    echo "!! không tìm thấy env file — chỉ định bằng -e/--env-file hoặc tham số vị trí" >&2
    exit 1
  fi
fi

[ -f "$ENV_FILE" ] || { echo "!! không thấy $ENV_FILE" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "!! không tìm thấy lệnh docker" >&2; exit 1; }

# --- 1. Liệt kê các *_IMAGE đang active (dòng không bị comment) ------------
VARS=()
declare -A CURRENT
while IFS= read -r line; do
  if [[ "$line" =~ ^([A-Z][A-Z0-9_]*)=(.+)$ ]]; then
    var="${BASH_REMATCH[1]}"
    val="${BASH_REMATCH[2]}"
    [[ "$var" == *_IMAGE ]] || continue
    [[ -n "${CURRENT[$var]:-}" ]] || VARS+=("$var")
    CURRENT[$var]="$val"
  fi
done < "$ENV_FILE"

if [ "${#VARS[@]}" -eq 0 ]; then
  echo "!! không tìm thấy biến *_IMAGE nào trong $ENV_FILE" >&2
  exit 1
fi

echo "Các image trong $ENV_FILE:"
for i in "${!VARS[@]}"; do
  printf '  %2d) %-24s %s\n' "$((i + 1))" "${VARS[$i]}" "${CURRENT[${VARS[$i]}]}"
done

# --- 2. Chọn service ---------------------------------------------------------
# Đoán prefix hiện đang dùng trên host này, để gợi ý mặc định (không hardcode
# cho riêng project nào) — nhìn vào phần trước dấu "." đầu tiên của các tag
# đang active, ví dụ "thainguyen.2026.09.17.01.30" -> "thainguyen".
guess_prefix() {
  local var val tag candidate best="" best_n=0
  declare -A freq
  for var in "${VARS[@]}"; do
    val="${CURRENT[$var]}"
    tag="${val##*:}"
    if [[ "$tag" =~ ^([A-Za-z][A-Za-z0-9_-]*)\. ]]; then
      candidate="${BASH_REMATCH[1]}"
      freq[$candidate]=$(( ${freq[$candidate]:-0} + 1 ))
    fi
  done
  for candidate in "${!freq[@]}"; do
    if [ "${freq[$candidate]}" -gt "$best_n" ]; then
      best="$candidate"; best_n="${freq[$candidate]}"
    fi
  done
  echo "$best"
}

if [ -z "$SELECT" ]; then
  read -rp $'\nChọn số (cách nhau bởi khoảng trắng/dấu phẩy), hoặc "all": ' SELECT
fi
SELECT="${SELECT//,/ }"

SELECTED_VARS=()
declare -A SEEN
if [[ "${SELECT,,}" == "all" ]]; then
  SELECTED_VARS=("${VARS[@]}")
else
  for n in $SELECT; do
    if ! [[ "$n" =~ ^[0-9]+$ ]] || [ "$n" -lt 1 ] || [ "$n" -gt "${#VARS[@]}" ]; then
      echo "!! lựa chọn không hợp lệ: $n" >&2
      exit 1
    fi
    var="${VARS[$((n - 1))]}"
    [[ -n "${SEEN[$var]:-}" ]] && continue
    SEEN[$var]=1
    SELECTED_VARS+=("$var")
  done
fi

if [ "${#SELECTED_VARS[@]}" -eq 0 ]; then
  echo "Không chọn gì, thoát."
  exit 0
fi

# --- 3. Prefix + tag mới ------------------------------------------------------
if [ -z "$PREFIX" ]; then
  SUGGESTED="$(guess_prefix)"
  if [ -n "$SUGGESTED" ]; then
    read -rp "Prefix (mặc định: $SUGGESTED): " PREFIX
    PREFIX="${PREFIX:-$SUGGESTED}"
  else
    read -rp "Prefix (bắt buộc nhập, host này chưa có quy ước sẵn): " PREFIX
  fi
fi
if [ -z "$PREFIX" ] || ! [[ "$PREFIX" =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]*$ ]]; then
  echo "!! prefix không hợp lệ cho docker tag: '$PREFIX'" >&2
  exit 1
fi

TAG_SUFFIX="${PREFIX}.$(date +%Y.%m.%d.%H.%M)"

echo
echo "Sẽ thực hiện (tag mới dùng chung mốc thời gian $TAG_SUFFIX):"
for var in "${SELECTED_VARS[@]}"; do
  repo="${CURRENT[$var]%:*}"
  printf '  %-24s %s:latest  ->  %s:%s\n' "$var" "$repo" "$repo" "$TAG_SUFFIX"
done

if [ "$ASSUME_YES" -ne 1 ]; then
  read -rp $'\nXác nhận pull + tag + ghi vào '"$ENV_FILE"$' ? [y/N] ' CONFIRM
  [[ "${CONFIRM,,}" == "y" || "${CONFIRM,,}" == "yes" ]] || { echo "Huỷ."; exit 0; }
fi

# --- 4. Backup env trước khi sửa ---------------------------------------------
BACKUP="${ENV_FILE}.bak-imagebump-$(date +%Y%m%d-%H%M%S)"
cp -p "$ENV_FILE" "$BACKUP"
echo "Backup: $BACKUP"

UPDATED=()
FAILED=()

for var in "${SELECTED_VARS[@]}"; do
  current="${CURRENT[$var]}"
  repo="${current%:*}"
  latest_ref="${repo}:latest"
  new_ref="${repo}:${TAG_SUFFIX}"

  echo "==> [$var] docker pull $latest_ref"
  if ! docker pull "$latest_ref"; then
    echo "!! [$var] pull thất bại, bỏ qua — env giữ nguyên $current" >&2
    FAILED+=("$var")
    continue
  fi

  docker tag "$latest_ref" "$new_ref"

  tmp="$(mktemp "${ENV_FILE}.tmp.XXXXXX")"
  awk -v var="$var" -v newval="$new_ref" '
    BEGIN { pat = "^" var "=" }
    !done && $0 ~ pat {
      print var "=" newval
      print "#" $0
      done = 1
      next
    }
    { print }
  ' "$ENV_FILE" > "$tmp" && mv "$tmp" "$ENV_FILE"

  echo "    $var: $current -> $new_ref"
  UPDATED+=("$var: $current -> $new_ref")
done

echo
if [ "${#UPDATED[@]}" -gt 0 ]; then
  echo "Đã cập nhật ${#UPDATED[@]} biến trong $ENV_FILE:"
  printf '  %s\n' "${UPDATED[@]}"
fi
if [ "${#FAILED[@]}" -gt 0 ]; then
  echo "Pull thất bại (không đổi): ${FAILED[*]}" >&2
fi

echo
echo "Image cũ KHÔNG bị xoá (vẫn nằm trong 'docker images'), dòng tag cũ vẫn còn"
echo "dưới dạng comment trong $ENV_FILE, và có backup đầy đủ tại $BACKUP."
echo "Rollback nhanh:  cp \"$BACKUP\" \"$ENV_FILE\""
echo "Bước tiếp theo (KHÔNG tự chạy ở đây): docker compose pull, rồi recreate"
echo "từng service theo đúng runbook rollout của host này (rolling cho service"
echo "nhiều replica, reload nginx nếu nó cache hostname literal của container)."