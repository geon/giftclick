
BEGIN;

CREATE TABLE users (

	"id"          UUID PRIMARY KEY,
	"inviteRef"   UUID UNIQUE NOT NULL,

	"facebookId"  TEXT UNIQUE NOT NULL,

	"address"     TEXT NOT NULL DEFAULT '',

	"created"     TIMESTAMPTZ NOT NULL
	-- "lastVisit"   TIMESTAMPTZ NOT NULL -- Pointless. The last created click is better.
);


CREATE TABLE giftTypes (

	"sku"         TEXT PRIMARY KEY,

	-- TODO: Make an index or something prevent <0.
	"stock"       INT DEFAULT 0,
	"batchStock"  INT DEFAULT 0, -- The currently advertised number of gifts.
	"balance"     INT DEFAULT 0, -- The unused kickback cash in SEK cents.

	"timeRanOut"  TIMESTAMPTZ DEFAULT NULL, -- When last batch of gifts was run out of. Keep online for a day or so with an "out of stock" sticker.
	"published"   TIMESTAMPTZ DEFAULT NULL, -- Last time it was published. Used for ordering on overview.

	"created"     TIMESTAMPTZ NOT NULL
);


CREATE TABLE clicks (

	"id"          INT PRIMARY KEY,
	"userId"      UUID NOT NULL REFERENCES users     (id)  ON DELETE RESTRICT,
	"giftTypeSku" TEXT NOT NULL REFERENCES giftTypes (sku) ON DELETE RESTRICT,

	"created"     TIMESTAMPTZ NOT NULL
);
CREATE INDEX ON clicks ("userId", "giftTypeSku");


CREATE TABLE givenGifts (

	"id"          INT PRIMARY KEY,
	"userId"      UUID NOT NULL REFERENCES users     (id)  ON DELETE RESTRICT,
	"giftTypeSku" TEXT NOT NULL REFERENCES giftTypes (sku) ON DELETE RESTRICT,

	"bonusCode"   TEXT NOT NULL UNIQUE,
	"bonusGiven"  BOOLEAN NOT NULL DEFAULT FALSE,
	"sent"        BOOLEAN NOT NULL DEFAULT FALSE,

	"created"     TIMESTAMPTZ NOT NULL
);
CREATE INDEX ON givenGifts ("userId", "giftTypeSku");

COMMIT;
