INSERT INTO campaigns (slug, name, description, active)
VALUES (
  'welcome',
  'Meadow Lake Welcome Sequence',
  'Evergreen 5-email onboarding sequence for confirmed bonus pack subscribers.',
  TRUE
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active;

WITH campaign AS (
  SELECT id FROM campaigns WHERE slug = 'welcome'
)
INSERT INTO campaign_steps (
  campaign_id,
  step_key,
  delay_days,
  subject,
  preview_text,
  body_html,
  active
)
SELECT
  campaign.id,
  step.step_key,
  step.delay_days,
  step.subject,
  step.preview_text,
  step.body_html,
  TRUE
FROM campaign
CROSS JOIN (
  VALUES
    (
      'day-0-welcome',
      0,
      'Welcome to Meadow Lake',
      'Your bonus pack is ready, and this is your soft place to start.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>I am so glad you are here.</p>
        <p>Your Meadow Lake Reader Bonus Pack is ready whenever you want to open it again: <a href="{{bonus_pack_url}}">download the bonus pack</a>.</p>
        <p>Meadow Lake is built for readers who love emotional small-town romance: coffee on a rushed morning, families who show up, quiet grief, patient love, and second chances that feel earned.</p>
        <p>If you are new to the series, start with <a href="https://www.amazon.com/When-Bruised-Hearts-Collide-Meadow-ebook/dp/B0FKTR4P1Z/"><em>When Bruised Hearts Collide</em></a>. It begins with Sylvie Charles, Rhys Anderson, and one ordinary forgotten coffee that changes more than either of them expects.</p>
        <p>Warmly,<br>Lovern Martindale</p>
        <p style="font-size:13px;color:#735b57;">You are receiving this because you requested the Meadow Lake Reader Bonus Pack. You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-2-book-1',
      2,
      'All because she forgot her coffee',
      'A soft introduction to Sylvie, Rhys, and the first Meadow Lake romance.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>Some love stories do not begin with fireworks.</p>
        <p>Some begin with a woman trying to keep herself together, a man who notices more than she expects, and a coffee she meant to remember.</p>
        <p>That is the doorway into <em>When Bruised Hearts Collide</em>, the first Meadow Lake romance. Sylvie Charles is carrying a grief she does not advertise. Rhys Anderson owns the kind of cafe where ordinary mornings can become turning points.</p>
        <p>This book is for readers who love wounded characters, small-town warmth, emotional restraint, dogs underfoot, and love that feels safest when it starts quietly.</p>
        <p>If that sounds like your kind of comfort read, <a href="https://www.amazon.com/When-Bruised-Hearts-Collide-Meadow-ebook/dp/B0FKTR4P1Z/">start <em>When Bruised Hearts Collide</em> on Amazon</a>.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-4-meadow-lake',
      4,
      'The little things that make Meadow Lake feel like home',
      'Coffee, porch swings, family meals, and the kind of love that stays.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>One of my favorite things about Meadow Lake is that love does not only show up in the big dramatic moments.</p>
        <p>It shows up in coffee remembered after a hard morning. In a porch swing when the evening gets too quiet. In family meals, familiar roads, dogs who make a house feel less empty, and friends who tell the truth gently.</p>
        <p>That is the heart of this series: not perfect people finding perfect love, but bruised hearts learning that home can still be trusted.</p>
        <p>If you have started reading, I hope you are finding those little places to rest inside the story.</p>
        <p>When you are ready for more Meadow Lake, <a href="https://www.amazon.com/author/lovern-martindale">visit Lovern Martindale's Amazon author page</a>.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-7-book-2',
      7,
      'When a heart does not need fixing',
      'A spoiler-safe bridge from Book 1 into Camille and Theo''s story.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>If <em>When Bruised Hearts Collide</em> is about the ordinary moment that opens a door, <em>When Bruised Hearts Heal</em> is about what happens when staying becomes its own kind of courage.</p>
        <p>Camille Jordan and Theo Beckett bring a different ache to Meadow Lake. Their story carries creative work, business pressure, family warmth, romantic hesitation, and the quiet question underneath so many healing romances: what if love does not fix you, but gives you room to become whole?</p>
        <p>You do not need spoilers to know whether this one is for you. If you love patient tension, soft hope after hard seasons, and a town full of people who keep pulling each other back toward home, <a href="https://www.amazon.com/When-Bruised-Hearts-Heal-Meadow-ebook/dp/B0GJTZKM6T/">Book 2 belongs on your list</a>.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-14-reader-note',
      14,
      'A small favor, if Meadow Lake stayed with you',
      'Reviews help other emotional romance readers find the series.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>If you have spent time in Meadow Lake already, thank you.</p>
        <p>Reader support is what helps quiet, emotional books find the people who need them. A short review, an Amazon author follow, or a recommendation to a friend can make a real difference.</p>
        <p>It does not have to be long. Even a simple note like "warm emotional small-town romance" or "loved the healing and family warmth" helps the right readers recognize their kind of book.</p>
        <p>And if you are still reading, no rush. Meadow Lake is best taken at the pace your heart wants.</p>
        <p>You can also <a href="https://www.amazon.com/author/lovern-martindale">follow Lovern Martindale on Amazon</a> so new Meadow Lake books are easier to find.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    )
) AS step(step_key, delay_days, subject, preview_text, body_html)
ON CONFLICT (campaign_id, step_key) DO UPDATE SET
  delay_days = EXCLUDED.delay_days,
  subject = EXCLUDED.subject,
  preview_text = EXCLUDED.preview_text,
  body_html = EXCLUDED.body_html,
  active = EXCLUDED.active;
