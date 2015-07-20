
WITH
    givenGiftType AS (
        -- Count the uncounted clicks for the specific giftType.
        UPDATE giftTypes
        SET
            "stock" = "stock" - 1,
            "batchStock" = "batchStock" - 1
        WHERE
            "sku" = $1
            AND "stock" > 0
        RETURNING *
    ),
    countedClicks AS (
        -- Count the uncounted clicks for the specific giftType.
        UPDATE clicks
        SET "counted" = TRUE
        FROM
            givenGiftType
        WHERE
            clicks."giftTypeSku" = givenGiftType."sku"
            AND NOT "counted"
        RETURNING *
    ),
    winner AS (
        -- Draw a winner. Every click counts as an equal lottery ticket.
        SELECT "userId"
        FROM countedClicks
        LIMIT 1 -- Only one winner.
        OFFSET (
            -- Pick a random row.
            SELECT FLOOR(RANDOM() * COUNT(*)) AS "randomRowIndex"
            FROM countedClicks
        )
    )
INSERT INTO givenGifts (
    "userId",
    "giftTypeSku"
)
VALUES (
    (SELECT "userId" FROM winner),
    (SELECT "sku" FROM givenGiftType)
)
;
