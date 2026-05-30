INSERT INTO campaigns (slug, name, description, active)
VALUES (
  'welcome',
  'Meadow Lake Welcome Sequence',
  'Evergreen 19-email welcome and nurture sequence for confirmed bonus pack subscribers.',
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
      'Your bonus pack is ready, and Book 1 is the soft place to start.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>I am so glad you are here.</p>
        <p>Your Meadow Lake Reader Bonus Pack is ready whenever you want to open it again: <a href="{{bonus_pack_url}}">download the bonus pack</a>.</p>
        <p>Meadow Lake is built for readers who love emotional small-town romance: coffee on a rushed morning, families who show up, quiet grief, patient love, and second chances that feel earned.</p>
        <p>If you are new to the series, start with <a href="https://www.amazon.com/When-Bruised-Hearts-Collide-Meadow-ebook/dp/B0FKTR4P1Z?maas=maas_adg_3CB401682915C973F4EBBFB510B19CD5_afap_abs&amp;ref_=aa_maas&amp;tag=maas"><em>When Bruised Hearts Collide</em></a>. It begins with Sylvie Charles, Rhys Anderson, and one ordinary forgotten coffee that changes more than either of them expects.</p>
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
        <p>If that sounds like your kind of comfort read, <a href="https://www.amazon.com/When-Bruised-Hearts-Collide-Meadow-ebook/dp/B0FKTR4P1Z?maas=maas_adg_3CB401682915C973F4EBBFB510B19CD5_afap_abs&amp;ref_=aa_maas&amp;tag=maas">start <em>When Bruised Hearts Collide</em> on Amazon or read free with Kindle Unlimited</a>.</p>
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
        <p>If you have started reading, I hope you are finding those little places to rest inside the story. If Book 1 is still waiting for you, Meadow Lake will be there when you are ready.</p>
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
        <p>You do not need spoilers to know whether this one is for you. If you love patient tension, soft hope after hard seasons, and a town full of people who keep pulling each other back toward home, <a href="https://www.amazon.com/When-Bruised-Hearts-Heal-Meadow-ebook/dp/B0GJTZKM6T?maas=maas_adg_930E2EA670DB7702CFE2C375D538D5E3_afap_abs&amp;ref_=aa_maas&amp;tag=maas">Book 2 belongs on your list</a>.</p>
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
        <p>If you have started or finished a Meadow Lake book already, thank you.</p>
        <p>Reader support is what helps quiet, emotional books find the people who need them. A short honest review, a shelf add, an Amazon author follow, or a recommendation to a friend can make a real difference.</p>
        <p>It does not have to be long. Even a simple note like "warm emotional small-town romance" or "loved the healing and family warmth" helps the right readers recognize their kind of book.</p>
        <p>If you feel comfortable leaving one, I made a simple page with the main review links here: <a href="https://www.lovernmartindale.com/reviews">review Meadow Lake</a>.</p>
        <p>And if you are still reading, no rush. Meadow Lake is best taken at the pace your heart wants.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-21-book-3',
      21,
      'One more Meadow Lake heart learning how to grow',
      'A gentle bridge into Wesley and Emily''s story.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>By the time readers reach <em>When Bruised Hearts Grow</em>, Meadow Lake has become more than one romance. It has become a family, a town, and a place where love keeps asking people to become a little braver.</p>
        <p>Wesley Charles and Emily carry that next part of the series with quiet steadiness, family ties, long-distance pressure, work that matters, and the question of where home really belongs.</p>
        <p>If you are ready to continue the series, <a href="https://www.amazon.com/When-Bruised-Hearts-Grow-Meadow-ebook/dp/B0H2RLC3JV?maas=maas_adg_CC36F239C7B271277249E7799AA54E86_afap_abs&amp;ref_=aa_maas&amp;tag=maas">Book 3 is waiting for you here</a>.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-35-home',
      35,
      'Why Meadow Lake feels like home',
      'A quiet note about the small-town heart underneath the series.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>Whether you have already spent time in Meadow Lake or the books are still waiting on your list, I wanted to share the feeling I keep returning to when I write this series.</p>
        <p>Home is not always the place where everything went right. Sometimes it is the place where someone still saves you a seat, remembers how you take your coffee, and lets you be honest about the hard parts.</p>
        <p>That is the emotional center of Meadow Lake: bruised people, familiar roads, soft places to land, and love that does not demand pretending.</p>
        <p>If you want to begin there, <a href="https://www.amazon.com/When-Bruised-Hearts-Collide-Meadow-ebook/dp/B0FKTR4P1Z?maas=maas_adg_3CB401682915C973F4EBBFB510B19CD5_afap_abs&amp;ref_=aa_maas&amp;tag=maas"><em>When Bruised Hearts Collide</em> is the first door into town</a>.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-49-healing-romance',
      49,
      'For readers who love healing romance',
      'If you like slow hope after hard seasons, Meadow Lake was written for you.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>I have always been drawn to romances where love is not a magic fix.</p>
        <p>I like stories where two people are still carrying things. Where trust comes slowly. Where affection shows up in ordinary ways before anyone is brave enough to name it.</p>
        <p>That is the kind of romance Meadow Lake holds: emotional, patient, family-centered, and hopeful without pretending life has been easy.</p>
        <p>If that is the kind of book you reach for when you want your heart handled gently, <a href="https://www.amazon.com/When-Bruised-Hearts-Collide-Meadow-ebook/dp/B0FKTR4P1Z?maas=maas_adg_3CB401682915C973F4EBBFB510B19CD5_afap_abs&amp;ref_=aa_maas&amp;tag=maas">Book 1 is available on Amazon and in Kindle Unlimited</a>.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-63-forgotten-coffee',
      63,
      'The coffee that started everything',
      'One ordinary missed errand can change more than expected.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>Book 1 begins with such a small thing: a forgotten coffee.</p>
        <p>That is what I love about quiet emotional romance. The turning point does not always look dramatic from the outside. Sometimes it looks like a rushed morning, a cafe owner paying attention, and a woman who does not yet know she is about to be seen differently.</p>
        <p>Sylvie and Rhys begin there. Not with grand speeches. Not with easy answers. Just one small moment that opens the door to something tender.</p>
        <p>If you have not started yet, <a href="https://www.amazon.com/When-Bruised-Hearts-Collide-Meadow-ebook/dp/B0FKTR4P1Z?maas=maas_adg_3CB401682915C973F4EBBFB510B19CD5_afap_abs&amp;ref_=aa_maas&amp;tag=maas">you can step into their story here</a>.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-77-book-2-nudge',
      77,
      'If Camille and Theo are waiting for you',
      'A gentle reminder for the second Meadow Lake romance.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>If you are somewhere in Meadow Lake right now, I hope you are finding the story at the right pace for you.</p>
        <p>And if Camille Jordan and Theo Beckett are still waiting, their book carries a different kind of ache: creative pressure, family warmth, guarded hearts, and the quiet courage of letting someone stay close.</p>
        <p>You can read the series slowly. You can read out of curiosity. You can come back when life gives you room. The town will still be there.</p>
        <p>When you are ready, <a href="https://www.amazon.com/When-Bruised-Hearts-Heal-Meadow-ebook/dp/B0GJTZKM6T?maas=maas_adg_930E2EA670DB7702CFE2C375D538D5E3_afap_abs&amp;ref_=aa_maas&amp;tag=maas"><em>When Bruised Hearts Heal</em> is here</a>.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-91-reader-question',
      91,
      'A question for you',
      'I would love to know what kind of romance moment stays with you.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>I have a reader question today.</p>
        <p>What kind of romance moment stays with you the longest?</p>
        <p>Is it the first time a character feels truly seen? The almost-confession? The family dinner where someone finally belongs? The quiet apology? The hand held at exactly the right time?</p>
        <p>Those small emotional moments are the reason I keep writing Meadow Lake. The big turns matter, but the tender moments are often what readers remember.</p>
        <p>If you want to tell me yours, you can just hit reply. I read reader notes with a grateful heart.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-105-review-reminder',
      105,
      'A small favor for Meadow Lake',
      'Reviews and shelf adds help quiet emotional romance find the right readers.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>If a Meadow Lake book has been part of your reading life already, I have a small favor to ask.</p>
        <p>An honest review or shelf add helps other readers decide whether this series is their kind of emotional small-town romance. It does not need to be long or polished. A few sincere words are enough.</p>
        <p>If you have not read yet, please do not feel rushed. This note is only here for when the timing makes sense.</p>
        <p>I gathered the main review links in one place here: <a href="https://www.lovernmartindale.com/reviews">leave or save a Meadow Lake review link</a>.</p>
        <p>Thank you for helping quiet books travel further.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-119-book-3-courage',
      119,
      'Wesley and Emily''s kind of courage',
      'Book 3 carries family ties, distance, work, and the question of home.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>Every Meadow Lake romance asks its characters to be brave in a slightly different way.</p>
        <p>For Wesley Charles and Emily, that courage is quieter. It lives inside family ties, distance, meaningful work, old expectations, and the question of what it means to grow without losing the people and places that shaped you.</p>
        <p>You do not need to be caught up for this note to make sense. Think of it as a soft marker for the road ahead whenever you are ready to continue.</p>
        <p><a href="https://www.amazon.com/When-Bruised-Hearts-Grow-Meadow-ebook/dp/B0H2RLC3JV?maas=maas_adg_CC36F239C7B271277249E7799AA54E86_afap_abs&amp;ref_=aa_maas&amp;tag=maas"><em>When Bruised Hearts Grow</em> is available here</a>.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-133-family-bonds',
      133,
      'The families we choose and the ones that shape us',
      'A spoiler-safe note on one of Meadow Lake''s deepest themes.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>One thread running through Meadow Lake is family.</p>
        <p>Not only romance. Not only the ache of falling in love after hurt. Family in all its complicated forms: the people who raised us, the people who misunderstand us, the people who surprise us, and the people who become home by choosing to stay.</p>
        <p>I try to write those bonds honestly. Tender, imperfect, sometimes painful, often healing.</p>
        <p>If that is one of the things you love in romance, Meadow Lake was built with you in mind.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-147-bonus-pack-reminder',
      147,
      'Your Meadow Lake bonus pack, in case you want it again',
      'A quick link back to the reader bonus pack.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>Just in case the link got buried, here is your Meadow Lake Reader Bonus Pack again: <a href="{{bonus_pack_url}}">download the bonus pack</a>.</p>
        <p>It is there for whenever you want a little extra atmosphere around the series: the mood, the feeling of the town, and the soft places inside these stories.</p>
        <p>If you know another reader who loves emotional small-town romance, you can also send them to the public signup page at <a href="https://www.lovernmartindale.com/bonus-pack">lovernmartindale.com/bonus-pack</a>.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-161-romance-reader',
      161,
      'What kind of romance reader are you?',
      'A simple reader-preference note for future Meadow Lake emails.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>I am curious what you reach for first in a romance.</p>
        <p>Do you love second chances? Slow emotional healing? Small-town family dynamics? Protective tenderness? Grumpy-soft tension? A little ache before the hope arrives?</p>
        <p>Meadow Lake has pieces of all of those, but every reader comes to the series for a slightly different reason.</p>
        <p>If you feel like replying, I would love to know which kind of romance hook makes you pick up a book fastest.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-175-tbr',
      175,
      'If Meadow Lake is still on your TBR',
      'No pressure, just a gentle reminder for your Kindle Unlimited list.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>If Meadow Lake is still sitting patiently on your TBR, this is your gentle reminder that there is no wrong pace for reading.</p>
        <p>Some books find us right away. Some wait until the season of life matches the story. Emotional romance can be like that.</p>
        <p>When you want a small-town book with grief, tenderness, family warmth, coffee, and a love story that begins quietly, <a href="https://www.amazon.com/When-Bruised-Hearts-Collide-Meadow-ebook/dp/B0FKTR4P1Z?maas=maas_adg_3CB401682915C973F4EBBFB510B19CD5_afap_abs&amp;ref_=aa_maas&amp;tag=maas"><em>When Bruised Hearts Collide</em> is ready for you</a>.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-189-series-path',
      189,
      'The full Meadow Lake path',
      'A simple series map in case you want every book in one place.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>If you ever want the Meadow Lake reading path in one place, here it is:</p>
        <p>Book 1: <a href="https://www.amazon.com/When-Bruised-Hearts-Collide-Meadow-ebook/dp/B0FKTR4P1Z?maas=maas_adg_3CB401682915C973F4EBBFB510B19CD5_afap_abs&amp;ref_=aa_maas&amp;tag=maas"><em>When Bruised Hearts Collide</em></a></p>
        <p>Book 2: <a href="https://www.amazon.com/When-Bruised-Hearts-Heal-Meadow-ebook/dp/B0GJTZKM6T?maas=maas_adg_930E2EA670DB7702CFE2C375D538D5E3_afap_abs&amp;ref_=aa_maas&amp;tag=maas"><em>When Bruised Hearts Heal</em></a></p>
        <p>Book 3: <a href="https://www.amazon.com/When-Bruised-Hearts-Grow-Meadow-ebook/dp/B0H2RLC3JV?maas=maas_adg_CC36F239C7B271277249E7799AA54E86_afap_abs&amp;ref_=aa_maas&amp;tag=maas"><em>When Bruised Hearts Grow</em></a></p>
        <p>Each book has its own couple, but the emotional thread keeps carrying forward: bruised hearts, family bonds, small-town comfort, and hope that feels earned.</p>
        <p>Warmly,<br>Lovern</p>
        <p style="font-size:13px;color:#735b57;">You can <a href="{{unsubscribe_url}}">unsubscribe here</a>.</p>
      $email$
    ),
    (
      'day-203-thank-you',
      203,
      'Thank you for being here',
      'A quiet closing note for the Meadow Lake welcome sequence.',
      $email$
        <p>Hi {{first_name}},</p>
        <p>I wanted to close this welcome sequence with a simple thank you.</p>
        <p>Thank you for making room for Meadow Lake in your inbox, your Kindle, your TBR, or your reading life. However far you have gone into the series, I am grateful you are here.</p>
        <p>If the books have meant something to you, a review, shelf add, author follow, or recommendation to a friend helps more than most readers realize. The review links are still here whenever you need them: <a href="https://www.lovernmartindale.com/reviews">Meadow Lake review links</a>.</p>
        <p>I will keep writing the kind of romance that believes bruised hearts can still find soft places to land.</p>
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
