export interface SignalGuide {
  slug: string; title: string; description: string; question: string; answer: string;
  evidence: "checkout" | "delay" | "weekends" | "accuracy";
  sections: { title: string; paragraphs: string[] }[];
  steps: string[];
  faqs: { question: string; answer: string }[];
}
export const SIGNAL_REVIEWED = "2026-11-07";
export const SIGNAL_HUB = "/stock-signal-guides";
export const signalGuides: readonly SignalGuide[] = [
  {
    slug: "why-iphone-stock-disappears-at-checkout", title: "Why iPhone stock disappears at checkout: reading a short availability window",
    description: "An iPhone can show pickup availability and disappear before checkout. Compare recorded listing windows, distinguish observations from reservations, and troubleshoot the next attempt.",
    question: "Why does an iPhone show in stock but disappear when I try to buy it?",
    answer: "The stock result and checkout happen at different times. A store-configuration pair may stop being offered between those steps, or the checkout may be asking about a different configuration or location. A tracker observation cannot reserve inventory or establish why Apple rejected an individual order.",
    evidence: "checkout",
    sections: [
      { title: "The listing and the order are different events", paragraphs: [
        "A pickup lookup asks whether a particular phone is being offered at a particular store when the request is answered. An order is a later transaction with its own configuration, account, payment and collection choices. Even an accurately reported lookup cannot make those two moments simultaneous. The useful question is therefore not simply whether a tracker was right, but what was observed, when it was observed and what happened before checkout was completed.",
        "RestockWire records changes in pickup availability. It does not see Apple's allocation queue, the number of units behind a listing or another customer's cart. Competition from other buyers is one possible explanation for a short window, but the public observation alone cannot prove that explanation. A change in what Apple offers, a mismatched option or a checkout issue may produce a similar experience for the person trying to buy."
      ] },
      { title: "Read a sell-out window as a bound, not a stopwatch", paragraphs: [
        "The evidence panel on this page uses recorded restock and sold-out observations for US iPhone Duo configurations. If a listing was still present at one check and gone at the next, the disappearance happened somewhere between them. The interval is more honest than saying that a phone sold out at a perfectly known second. Where an older record lacks a last-positive observation, the underlying duration method uses an estimated lower bound and labels that distinction.",
        "These intervals measure the life of an observed listing, not the time any one shopper had to finish an order. A listing could have existed before the first positive check. A very brief appearance could fall entirely between checks and never enter the log. A long listing might represent one or many devices; the lookup does not reveal quantity. Use the table to understand how fleeting observations can be, not to set a guaranteed checkout timer."
      ] },
      { title: "Verify that the two screens describe the same item", paragraphs: [
        "Compare the model, capacity, color and store on the tracker with the choices in Apple's buying flow. A page can retain a previous selection when you change stores or products. Nearby branches can have similar names, and a result for one storage tier does not apply to another. Before concluding that inventory vanished, check that the retailer's page is asking the same question as the observation you followed.",
        "Also distinguish pickup from delivery. An estimated delivery date or a product page that is available to order does not establish local collection availability. If a buying flow offers carrier, payment or other purchase conditions, those may affect the options shown to you. RestockWire does not test every possible checkout arrangement. The evidence here concerns the public pickup signal, while your actual order flow remains the authority for whether you can buy that item."
      ] },
      { title: "Use timestamps to reconstruct the attempt", paragraphs: [
        "Record the store, exact configuration and the time you saw the signal. Then note when you opened Apple's page and what it displayed. A screenshot without a timestamp or configuration can be difficult to interpret later. Compare times in the same time zone, and distinguish a stock observation from the time a page refreshed or a notification appeared on your phone. Those clocks describe different stages of the process.",
        "The table below is a sample of recent closed listing windows, not a personal transaction log. It cannot tell whether your cart failed because another buyer completed an order, because a session expired or because an item was no longer offered. If the message concerns payment, account verification or an existing order, use Apple's order and support channels. A stock tracker has no access to the transaction details needed to diagnose those problems."
      ] },
      { title: "Prepare the decision, then verify the purchase", paragraphs: [
        "Decide which configurations and stores you would accept before an alert arrives. That reduces the amount of comparison you need to do while a listing is available. Check that you can sign in to the retailer normally and understand your intended purchase arrangement. Preparation can remove avoidable hesitation, but it cannot reserve a device or guarantee that availability will last through the final step.",
        "When the item is offered, read the order details rather than rushing past a changed selection. If you receive confirmation, follow Apple's order status and collection instructions from then on. A later sold-out signal does not automatically mean your confirmed order has been cancelled, just as a later in-stock signal does not confirm an order that never completed. The public inventory feed and your private order status answer different questions."
      ] },
      { title: "A failed attempt does not establish a store's future pattern", paragraphs: [
        "One short listing can be frustrating without being predictive. It does not prove that the store always restocks at that hour, that a particular color is impossible to buy or that every alert arrives too late. Look at several dated observations and their coverage before forming a pattern. Even a repeated historical pattern is not a published replenishment schedule, and it should not be described as a promise about tomorrow.",
        "After an unsuccessful checkout, return to a deliberate shortlist and watch the next relevant signal. Repeatedly changing to phones or stores you would not otherwise choose can create a worse purchase even if checkout succeeds. If the same technical error appears when inventory is clearly offered, investigate that error separately. This guide explains the evidence boundary around a stock listing; it does not replace retailer support for a recurring transaction failure."
      ] }
    ],
    steps: ["Match the exact configuration and store.", "Compare observation and checkout times.", "Read the retailer's error or order status.", "Use a confirmed ready-for-pickup message before traveling."],
    faqs: [
      { question: "Does adding an iPhone to a cart reserve it?", answer: "Do not treat a tracker signal or a cart step as a confirmed collection arrangement. Follow the retailer's current checkout and order messages. RestockWire cannot verify that a device has been allocated to an individual cart." },
      { question: "Does sold out mean the store has zero phones in the building?", answer: "No. It means the queried configuration was not offered for the pickup lookup at that time. The feed does not expose a physical stock count, back-room inventory or devices already allocated to customers." },
      { question: "Why show a time range instead of an exact sell-out time?", answer: "The disappearance occurs between observations. A range preserves that uncertainty. When a lower bound is estimated because a last-positive check is unavailable, the table marks it rather than presenting the estimate as an exact measurement." }
    ]
  },
  {
    slug: "iphone-stock-alert-delay", title: "Why an iPhone stock alert arrives late: the stages worth checking",
    description: "Separate stock observation age, synchronization, alert eligibility and device delivery. Use a live freshness sample and a practical checklist to investigate delayed iPhone notifications.",
    question: "Why did I receive an iPhone stock alert after it was already gone?",
    answer: "A stock change must be observed, synchronized, matched to a running rule and delivered to your device. Availability can end during any of those stages. A recent source timestamp helps assess the data, but it does not measure your phone's notification delay or prove that an order was still possible when you tapped.",
    evidence: "delay",
    sections: [
      { title: "There is more than one clock in an alert", paragraphs: [
        "The retailer changes what it offers, the collector receives a lookup response, the site receives the observation, the alert service evaluates a rule and the device displays a notification. Those are distinct events. A short collection interval describes only part of that chain. It cannot be advertised as the time every customer will see a message, especially when a device is offline or its operating system manages delivery.",
        "Start by identifying which time is visible in the interface you are using. An inventory check time belongs to a stock observation. A message timestamp may describe when it was created or sent. The time you noticed a banner is later still. Comparing the first and last can describe your experience, but only a complete, consistently timestamped trace can attribute the difference to one particular stage."
      ] },
      { title: "The freshness sample measures source age, not end-to-end delivery", paragraphs: [
        "The panel below summarizes the newest recorded check at each US store in RestockWire's database. It reports how many stores have a recent observation and the age distribution of those newest checks at the sample time. A store can have one recently checked configuration while another configuration is older, so the summary is deliberately labeled as a store-level sample. It is not proof that every part number is equally fresh.",
        "The site receives a synchronized inventory feed. If synchronization pauses, a healthy collector elsewhere does not by itself make this site's copy current. Conversely, a current stock table does not prove that a particular notification reached a phone. The panel is cached briefly and shows its sample timestamp so an older page is not mistaken for a live stopwatch. It should narrow an investigation, not end one prematurely."
      ] },
      { title: "Check whether the rule was eligible to send", paragraphs: [
        "A saved store preference is not necessarily a running alert. Review the exact configuration, store, subscription status and the rule's current state. A list can include saved selections beyond the active allowance, or an option may have been paused or removed. If the rule was not eligible when an event was processed, the absence of a message is different from a message that was sent and then delayed.",
        "Also consider whether the change qualified as a new alert event. Systems commonly distinguish a first observation, an ongoing listing and a transition back into availability. Repeated notifications may be suppressed to avoid sending the same signal continuously. The relevant evidence is the rule and event processing record, not the number of times you refreshed the page. Customer support can investigate an identified event more effectively when you provide the exact store, configuration and approximate time."
      ] },
      { title: "Inspect the device channel separately", paragraphs: [
        "Once a message has been handed to a delivery service, the device still needs to receive and present it. Network access, notification permissions, operating-system settings and focus modes can affect that experience. A test notification helps establish that a channel works now; it does not prove that a historical notification arrived at the same speed. Avoid using a successful test to dismiss a specific earlier problem without checking its timestamps.",
        "If you use several devices, identify which subscription belongs to the device you expect to carry. An old browser installation can remain associated with a channel you no longer use. RestockWire has separate guides for Apple Watch, Focus modes and Android notification setup. Use those for the relevant device, then return to the stock observation timeline. Treating every issue as a collector problem can leave a device setting unresolved."
      ] },
      { title: "Separate a late notification from a short opportunity", paragraphs: [
        "An alert can be delivered promptly and still lead to a sold-out page if the observed listing was brief. It can also be delayed while an item remains available for much longer. Those experiences feel different but cannot be distinguished merely by whether checkout succeeded. Compare the listing window with the message timeline before concluding that the entire service is consistently slow or that one successful purchase proves all notifications are fast.",
        "Our checkout guide explains the intervals used to bound observed listing lifetimes. The bounds are not a shopper-specific timer. They help establish whether a window was short enough that even small delays could matter. A listing can disappear before another scheduled check, and some very short appearances may never be observed. These limitations remain even when a collector and delivery channel are operating normally."
      ] },
      { title: "Report a delay with enough detail to investigate", paragraphs: [
        "A useful report includes the store, model, capacity, color, observation time if visible, message time and the time zone of your device. Describe whether you received a push, an email or no message at all. Say whether you were online and whether a test notification currently works. Do not include payment details, passwords or authentication codes. Support needs a reproducible timeline, not private checkout credentials.",
        "When reviewing the result, distinguish confirmed measurements from inferences. A send record can confirm that a service attempted delivery; it does not necessarily confirm the instant a person saw a banner. A current observation can show the feed recovered; it does not erase a previous gap. The goal is to locate the stage that needs attention and set realistic expectations, not to invent a single universal latency number from unrelated health indicators."
      ] }
    ],
    steps: ["Identify the observation, send and display times.", "Check the exact rule's running status.", "Test the notification channel on the intended device.", "Report a specific event with its time zone."],
    faqs: [
      { question: "Is a five-second poll the same as a five-second alert?", answer: "No. Collection, synchronization, event processing and device delivery are separate stages. A polling interval alone cannot guarantee the time a notification will appear on your phone." },
      { question: "Does a fresh stock page prove every alert is working?", answer: "No. Feed freshness says something about recorded observations. A user's rule eligibility and notification channel require separate evidence. A site can have recent inventory while a particular device or saved selection needs attention." },
      { question: "Can this public page measure my personal notification latency?", answer: "No. It does not read your account or device delivery records. The live sample summarizes public stock checks. Investigating an individual delay requires the relevant event and message timestamps." }
    ]
  },
  {
    slug: "does-apple-restock-iphones-on-weekends", title: "Does Apple restock iPhones on weekends? What pickup observations can show",
    description: "See US iPhone Duo pickup restock observations grouped by store-local weekday. Understand the difference between recorded availability, shipments and a reliable weekend buying plan.",
    question: "Can iPhone pickup availability return on a Saturday or Sunday?",
    answer: "Check current listings rather than assuming weekends are excluded. Recorded pickup changes can show whether availability was observed on particular weekend dates, but they do not reveal shipment schedules or promise another restock. The table here reports dated observations, with first sightings excluded.",
    evidence: "weekends",
    sections: [
      { title: "Ask about pickup availability, not an invisible delivery truck", paragraphs: [
        "When shoppers ask whether Apple restocks on weekends, they may mean several things: whether a truck arrives, whether staff make devices available, whether cancelled orders return to sale or whether an online pickup option changes. A public inventory lookup directly answers only the last question. It cannot identify the internal process behind a new listing. A weekend pickup event is evidence of availability being offered, not proof of a weekend shipment.",
        "This distinction keeps the answer useful. If you want to place a pickup order, an offered configuration matters regardless of why it became available. If you want to predict a delivery schedule, the same event is insufficient evidence. RestockWire therefore calls the entries observed restocks and explains the detection rule. It does not label them deliveries, units received or a timetable published by Apple."
      ] },
      { title: "Use the store's local weekday", paragraphs: [
        "A timestamp shortly after midnight in one time zone can still belong to the previous day at a store elsewhere. Grouping every US event in UTC or in the viewer's time zone would move some observations into the wrong local weekday. Our table converts each event using the store's catalog time zone before counting. A Saturday entry therefore means Saturday at that store, not necessarily Saturday where you are reading this page.",
        "The analysis uses the last fourteen days of recorded US iPhone Duo events. It excludes first sightings so the initial start of tracking is not presented as a new replenishment. Multiple store-configuration pairs can change during the same moment and count as separate events. The table also shows distinct local dates with events, which helps distinguish one large burst from observations spread across several dates. Neither column counts physical devices."
      ] },
      { title: "A zero is not a guarantee that weekends are impossible", paragraphs: [
        "If the table shows no observations for a day, read that narrowly: none met this query's criteria in the available records and window. Collection may have started recently, a period may contain missing observations, or a short listing may have fallen between checks. A missing database connection is shown as unavailable rather than silently converted into a table of zeros. That separation is necessary for an honest answer.",
        "Likewise, one positive weekend event establishes an observation, not a dependable habit. The selected model and country matter. Another model may behave differently, and another country's stores may follow different operating arrangements. Keep the scope attached when sharing a number from the table. Removing the model, country, date range and method turns a specific measurement into a much broader claim that the data does not support."
      ] },
      { title: "Do not turn unequal weekdays into a best-day ranking", paragraphs: [
        "A short observation history can contain more of one weekday than another, and the current day is incomplete. Coverage can also vary by store and time. Comparing raw counts without accounting for those differences can make a day look stronger simply because more of it was observed. The table deliberately does not declare a best day or assign a probability that your preferred store will have a phone next weekend.",
        "Even with a longer sample, event totals can be concentrated in particular configurations or locations. A high national total may say little about the one finish and capacity you want nearby. Start with the dated national evidence, then inspect the relevant store history and current availability. Treat repeated patterns as descriptive context. They are not a substitute for checking whether the exact item can be ordered now."
      ] },
      { title: "Make a weekend plan that survives no new stock", paragraphs: [
        "Decide which stores you could reasonably collect from and what alternatives you would accept before the weekend starts. Keep a fallback if nothing suitable appears: continue waiting, use a delivery option that fits or keep using your current device. This prevents a broad national observation from turning into an unnecessary trip. A store that recorded a Saturday event last week has not promised one for your visit.",
        "If you do place an order, follow Apple's ready-for-pickup notification and collection instructions. Store hours and collection windows are separate from the observation time of a listing. A stock change outside your convenient travel hours may still be worth checking online, but it does not authorize arrival whenever you choose. Use the retailer's current order information to plan the actual visit."
      ] },
      { title: "Read the table as a reproducible answer", paragraphs: [
        "The method is intentionally compact: select the supported US stores and iPhone Duo part numbers, include confirmed restock transitions in the rolling window, exclude first sightings, convert timestamps to store-local dates and aggregate by weekday. The panel shows when the sample was produced and the first and last included event. Those details make it possible to understand what changed when the page is viewed later.",
        "The result may change as new events arrive and old ones leave the window. That is expected for a rolling analysis and does not mean an earlier number was necessarily wrong. When comparing two readings, keep their sample times. For a broader account of the week, use RestockWire's dated reports. For a buying decision, use the current configuration listing. Historical counts and present availability serve different purposes."
      ] }
    ],
    steps: ["Read the country, model and observation window.", "Check event dates, not just weekday totals.", "Inspect your actual store and configuration.", "Keep a fallback if no suitable pickup becomes available."],
    faqs: [
      { question: "Does a Sunday restock event prove a Sunday shipment?", answer: "No. It records a change in the pickup response. The feed does not reveal why the item became available or when physical stock arrived. Avoid turning an availability observation into a logistics claim." },
      { question: "Is Saturday better than Sunday for buying an iPhone?", answer: "This table does not establish that. Raw event counts are affected by coverage, the length of the sample, configurations and stores. Your practical options depend on current availability for the phone and location you can use." },
      { question: "Why exclude first sightings?", answer: "When tracking starts, a phone already offered can be seen for the first time without having just returned to stock. Excluding that initial observation makes the restock count more specifically about recorded transitions." }
    ]
  },
  {
    slug: "how-accurate-are-iphone-stock-trackers", title: "How accurate are iPhone stock trackers? A checklist for evaluating the evidence",
    description: "Evaluate an iPhone tracker by exact configuration, observation age, coverage, error handling and order boundaries. A live source-freshness sample explains what can and cannot be verified.",
    question: "Can I trust an iPhone stock tracker that says a store has availability?",
    answer: "Treat it as a timestamped observation to verify with the retailer. A useful tracker identifies the exact configuration and store, exposes freshness and explains missing data. An accuracy percentage needs a defined test against matching reference observations; a successful purchase or a healthy server alone does not establish that percentage.",
    evidence: "accuracy",
    sections: [
      { title: "Define what accurate is supposed to mean", paragraphs: [
        "Accuracy can mean agreement with a retailer response, detection of every brief stock appearance, correct notification delivery or success at checkout. Those are different outcomes. A tracker can faithfully report a response and still lead to an unsuccessful purchase because the response and transaction occur at different times. It can also miss a short appearance without displaying an incorrect positive listing. A useful evaluation states which outcome is being measured.",
        "For response accuracy, compare the same store and exact configuration at nearly the same time, using a documented reference. For detection coverage, you need evidence of appearances the tracker did not see. For notifications, inspect eligible rules and delivery records. For purchases, account for checkout conditions the tracker cannot observe. Combining all of these into one unsupported percentage creates confidence without a clear measurement behind it."
      ] },
      { title: "Check scope before judging a result", paragraphs: [
        "Look for a model, storage tier, color, country and store identifier. A general statement that an iPhone is available can hide a mismatch in any of those fields. A country-wide count may include stores hundreds of miles from you. A model-level summary may combine configurations you would not buy. Scope is not a footnote: it determines whether the observation is relevant to the question you are trying to answer.",
        "This page's evidence panel summarizes the newest recorded check per US store. It is deliberately not called a configuration-level accuracy test. One part number can be fresh while another at the same store is older. The panel helps assess broad source freshness, and the linked status page provides operational context. To evaluate a particular buying opportunity, inspect the exact configuration and confirm it in the retailer's current flow."
      ] },
      { title: "Freshness and correctness are related but not interchangeable", paragraphs: [
        "An old observation is less useful when inventory changes quickly, even if it was correct when recorded. A new observation may still have limitations in what the source offers or what the query covered. Therefore, a timestamp is necessary context, not a certificate that checkout will succeed. The page should distinguish when stock was checked from when a browser rendered a card or a cached page was served.",
        "RestockWire's freshness sample includes its own sample time so the numbers can be interpreted after caching. It reports missing checks separately from observed ages. If the query cannot be completed, the page says the sample is unavailable. That is preferable to showing an apparently reassuring zero or quietly treating an error as sold out. When a source is stale, uncertainty should remain visible rather than being converted into a confident inventory answer."
      ] },
      { title: "Ask how missed events and false signals are handled", paragraphs: [
        "Periodic observation has a blind spot between checks. A configuration that appears and disappears entirely inside that gap may never be recorded. This affects historical counts and any claim about capturing every opportunity. Network failures and temporarily unavailable responses can create additional gaps. A responsible method explains those limitations and keeps an unknown response distinct from a confirmed negative when processing observations.",
        "Repeated checks can help distinguish an isolated response from a persistent change, but waiting for confirmation can also delay recognition. There is a tradeoff between reacting quickly and reducing noisy signals. Public evidence should explain the resulting event definition without promising perfect detection. A historical restock count is a count under that definition and coverage, not an inventory ledger containing every device Apple made available."
      ] },
      { title: "Evaluate the alert separately from the stock display", paragraphs: [
        "A correct public stock table does not prove that every account has a running alert for that item. Subscription state, selected rules, notification permissions and device connectivity all matter. Conversely, a late notification does not by itself prove that the original stock observation was fabricated or stale. Separate the data question from the delivery question so you can identify the part that actually needs attention.",
        "Use a specific example when testing. Record the exact selection and the relevant timestamps, then inspect what the tracker displayed, what the retailer displayed and what message arrived. Do not infer system-wide performance from a single success or failure. A useful benchmark would cover multiple configurations and periods, publish the matching method and describe exclusions. This page does not have such a controlled dataset and therefore does not publish an accuracy score."
      ] },
      { title: "Use the tracker for discovery and the order system for commitment", paragraphs: [
        "The practical role of a tracker is to reduce the work of finding a relevant opportunity. Once you act on it, the retailer's checkout determines the available purchase options, and the order system determines the status of your purchase. Keep those boundaries clear. A green listing is not a reservation; a later sold-out state does not automatically cancel an order that Apple already confirmed.",
        "Before traveling, follow the ready-for-pickup notification and current collection instructions. Before changing an existing order, check its actual status and available actions. These habits make a tracker useful without giving it authority it does not possess. Evaluate a service by transparent scope, dated evidence, clear uncertainty and functioning tools, then use its observations as one part of a buying process you can verify."
      ] }
    ],
    steps: ["Match store, model, storage and color.", "Read the stock observation time.", "Separate source coverage from alert delivery.", "Verify the purchase and collection status with Apple."],
    faqs: [
      { question: "Can a tracker be 100% accurate?", answer: "Such a claim needs a precise definition, reference data, test window and treatment of missing observations. Periodic public stock checks do not provide universal knowledge of inventory or future checkout outcomes. This guide makes no percentage claim." },
      { question: "Does server uptime equal inventory accuracy?", answer: "No. An online server can display old or incomplete observations. Uptime, freshness, query coverage and agreement with a reference are different measurements. A useful status report labels each one rather than substituting one for another." },
      { question: "Should I trust a result with no timestamp?", answer: "It is harder to assess. Verify the exact configuration directly with the retailer and look for observation context. Without a time, you cannot tell whether a mismatch reflects a changing listing or an older result." }
    ]
  }
];
