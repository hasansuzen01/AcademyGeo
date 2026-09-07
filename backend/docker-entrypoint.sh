#!/bin/sh
# Brings the database up to the shape the code expects, then hands over.
#
# `db push` rather than `migrate deploy`, because the schema is the single
# source of truth in this project and the migrations folder has been allowed
# to fall behind it. Push compares the live database against schema.prisma and
# applies the difference, so it cannot deploy a half-built schema the way a
# stale migration history can.
#
# It refuses anything that would drop data unless told otherwise, and it is
# not told otherwise here: a rename that would cost a column stops the deploy
# instead of silently emptying it.
set -e

# No flags: Prisma 7 reads the schema from prisma.config.ts, and it answers an
# unrecognised flag by printing its help and exiting 0, which would mean the
# schema silently never being applied and the API starting against yesterday's
# database.
echo "Bringing the database up to date"
npx prisma db push

# Seeding is idempotent, and everything an admin can edit is written on the way
# in and never on the way back, so a redeploy adds what is new and touches
# nothing that has been changed since.
if [ "${SKIP_SEED:-}" = "1" ]; then
  echo "SKIP_SEED=1, leaving the deck alone"
else
  echo "Seeding the deck"
  node --experimental-strip-types prisma/seed.ts
fi

exec "$@"
