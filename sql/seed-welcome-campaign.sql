INSERT INTO campaigns (slug, name, description, active)
VALUES ('welcome', 'Meadow Lake Welcome Sequence', 'Placeholder campaign for future generated welcome emails.', FALSE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Add campaign_steps later after email copy is approved.
-- The scheduler sends only active campaigns and active steps.

