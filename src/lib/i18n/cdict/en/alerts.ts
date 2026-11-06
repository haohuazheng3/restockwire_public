/**
 * English client strings: the alert setup (AlertSetup, AlertEditor, PhoneMatrix, StorePicker, EmailSignIn,
 * PlanPanel, PlanButton). Plain data: "{name}" placeholders (format.fill, or Rich when a value is an element),
 * plural forms { one, other } with "#" for the number (format.plural). These values reproduce the site's
 * English text exactly, spaces and punctuation included (a leading space marks text that follows another
 * piece on the same line). Model names, storage sizes, plan names and "$5" amounts are filled in, never
 * translated; plans are billed in US dollars in every language.
 */
import type { CountryCode } from "@/lib/apple/countries";
import type { Forms } from "@/lib/i18n/format";

export const alerts = {
  /** The home page's block (AlertSetup). */
  setup: {
    title: "Set up alerts",
    lead: "Choose your phones, then the stores within reach. Each phone gets watched at each store you pick.",
  },

  /** The editor: phones × stores, the sum line, turning alerts on (AlertEditor). */
  editor: {
    /** Joins the two or three names a folded section lists. */
    listSep: ", ",
    phonesTitle: "Phones",
    storesTitle: "Stores",
    phonesNone: "Nothing picked: tick a configuration",
    storesNone: "Nothing picked: tick the stores within reach",
    phones: { one: "# phone", other: "# phones" } as Forms,
    stores: { one: "# store", other: "# stores" } as Forms,
    alerts: { one: "# alert", other: "# alerts" } as Forms,
    /** "1 phone × 3 stores = 3 alerts" ({phones}, {stores}, {alerts}: the three forms above). */
    sum: "{phones} × {stores} = {alerts}",
    pickBoth: "Choose one phone and one store at minimum.",
    /** {price}: "$5". */
    fits: "{plan} covers it: {limit} alerts for {price}/month.",
    overAny: "Beyond the largest plan ({most}).",
    tickStore: "Next, a store: every phone is watched at every store you tick.",
    tickPhone: "Next, a phone: it gets watched at every store you ticked.",
    tickEach: "Pick a phone and a store; every phone is watched at every store.",
    offUntilPlan: "Saved. Alerts stay paused until a plan is active.",
    onWith: "{plan}: {on} of {limit} running",
    /** After onWith: " · {n} off". */
    off: " · {n} off",
    overPlan: "{n} alerts is more than {plan}'s {limit}. Move up a plan, or untick some first.",
    overMost: "{n} alerts is more than the largest plan's {most}. Untick some first.",
    saving: "Saving",
    saved: "✓ Saved",
    notSaved: "Not saved",
    saveFailed: "Your alerts were not saved",
    saveFailedStatus: "Save failed ({status})",
    checkoutUnavailable: "Checkout is down for now",
    seePlans: "Compare plans",
    signIn: "Sign in",
    signInLead: "Your account is your email address: a 6-digit code arrives by email, and there is no password. First visit? That same code creates the account, and your alerts come next.",
    turnOn: { one: "Start this alert", other: "Start these # alerts" } as Forms,
    thenPlan: "Next comes a plan: {plan} covers them at {price}/month, cancel anytime.",
    untickFew: "The largest plan holds {most}, so untick a few first.",
    continueWith: { one: "Next, with # alert", other: "Next, with # alerts" } as Forms,
    /** Before choosePlan, just after signing in. */
    savedN: { one: "# alert saved. ", other: "# alerts saved. " } as Forms,
    choosePlan: { one: "Pick a plan and it starts", other: "Pick a plan and they start" } as Forms,
    /** After "$5" in bold. */
    perMo: "/mo",
    fitsYour: " · covers your {n}",
    /** {fast}, {all}, {push}: "5 s", "15 s", "3 s" (format.unit). The only intervals the site states: 15 s and 5 s. */
    speedLine: "Your stores are read every {fast} and the rest of the country every {all}; a confirmed restock reaches your phone in about {push}.",
    /** After speedLine. */
    afterSpeed: " Billed monthly, cancel anytime. Pay through Stripe by card or Link.",
    alertsOn: "✓ Alerts running. ",
    /** {device}: the phone's name ("iPhone"), else `phone`. */
    goesTo: "They arrive on your {device}.",
    phone: "phone",
    /** {link}: getOnPhoneLink as a link. */
    getOnPhone: "{link}.",
    getOnPhoneLink: "Set them up on your phone",
    myAlerts: "My alerts",
  },

  /** The phone grid (PhoneMatrix). */
  matrix: {
    model: "Model",
    configs: "{model}: configurations",
  },

  /** The store list (StorePicker). Place names come from i18n/places. */
  picker: {
    country: "Country",
    find: "Search stores",
    searchUs: "ZIP, city, state or store",
    search: "City or store",
    /** {noun}: regionNoun of the country. */
    searchRegion: "City, {noun} or store",
    locating: "Locating",
    nearMe: "Near me",
    nearestYou: "Closest to you",
    zipNotFound: "Unknown ZIP, showing the closest to that area",
    /** {place}: a ZIP, a store ("Apple Fifth Avenue"), a city or a region. */
    nearestTo: "Closest to {place}",
    regionFirst: "{place} A–Z, then the closest outside it",
    placeFirst: "{place} on top, then the closest outside it",
    finding: "Looking up stores near you…",
    noLocationUs: "Location unavailable: enter a ZIP or city, or choose a state",
    noLocation: "Location unavailable: enter a city or store",
    noLocationRegion: "Location unavailable: enter a city or store, or choose a {noun}",
    promptUs: "Enter a ZIP or city, or tap Near me",
    prompt: "Enter a city or store, or tap Near me",
    /** {unit}: `miles` or `km` (English pages say miles, all other languages km). {from}: `you` or a ZIP. */
    byRoad: "estimated {unit} by road from {from}",
    miles: "miles",
    km: "km",
    you: "you",
    zip: "ZIP {zip}",
    zipForDistances: "enter your ZIP to see distances",
    nearMeForDistances: "tap Near me to see distances",
    alreadyOn: "{n} running already",
    preticked: "closest {n} pre-ticked",
    pickRegion: "Choose a {noun}",
    /** Name of the level between country and city in a store list (state, prefecture, canton…). */
    regionNoun: {
      us: "state", ca: "province", au: "state", uk: "area", de: "state", fr: "department", it: "province", es: "province", jp: "prefecture",
      sg: "area", hk: "area", ae: "emirate", ch: "canton", nl: "province", se: "county", at: "state", be: "region", kr: "province", tw: "city",
    } satisfies Record<CountryCode, string>,
    storesLabel: "Stores",
    on: "running",
    turningOff: "switching off",
    byRoadTitle: "Estimated road distance",
    /** The drive time of a store you are at. */
    here: "here",
    directions: "Directions",
    /** {store}: "Apple Fifth Avenue". */
    directionsTo: "Get directions to {store}",
    showMore: "{n} more",
    noMatchUs: "Nothing found. Search by ZIP, city or state.",
    noMatch: "Nothing found. Search by city or store.",
    noMatchRegion: "Nothing found. Search by city, {noun} or store.",
    alsoChosen: "Already picked",
  },

  /** Email + code (EmailSignIn). */
  signIn: {
    sendCode: "Email me a code",
    sending: "Sending",
    verify: "Confirm",
    verifying: "Confirming",
    placeholder: "you@example.com",
    emailLabel: "Email",
    codeLabel: "6-digit code",
    invalidEmail: "That email address is not valid",
    enterCode: "Type the 6-digit code",
    incomplete: "Sign-in not finished ({status}); please retry",
    failed: "That did not work",
    /** {email}: the address, as an element. */
    codeSent: "Code on its way to {email}",
    resend: "send again",
    changeEmail: "use another email",
    /** {terms}, {privacy}: termsLink and privacyLink as links. */
    terms: "No password: your email address is the account, confirmed with a 6-digit code. Continuing means you accept the {terms} and {privacy}.",
    termsLink: "Terms",
    privacyLink: "Privacy Policy",
    /**
     * Clerk error codes mapped to local wording. English pages skip this and print Clerk's message unchanged.
     * A code missing here shows Clerk's message.
     */
    clerk: {
      form_code_incorrect: "Wrong code. Check the email and retry.",
      verification_expired: "This code is no longer valid. Tap send again for a fresh one.",
      verification_failed: "Too many incorrect codes. Tap send again for a fresh one.",
      form_param_format_invalid: "That email address is not valid",
      form_identifier_exists: "An account with this email already exists. Retry to sign in.",
      too_many_requests: "Too many attempts. Wait a minute and retry.",
      rate_limit_exceeded: "Too many attempts. Wait a minute and retry.",
      user_locked: "This account is temporarily locked. Retry later.",
    } as Record<string, string>,
  },

  /** The plan, changing and cancelling it (PlanPanel, ChangeConfirm, CancelConfirm). {price} and {amount}: "$5", "$4.17". */
  plan: {
    nextRenewal: "the next renewal",
    unavailable: "Not available at the moment",
    priceFailed: "No price for this change yet",
    bankConfirm: "Your bank has to approve the payment.",
    notChanged: "Your plan is unchanged. Retry in a minute.",
    changeTo: "Move to {plan}",
    upgradeTo: "Move up to {plan}",
    switchTo: "Move down to {plan}",
    today: "Today",
    /** An estimate (before Stripe has the exact figure). */
    about: "about {amount}",
    aboutCap: "About {amount}",
    daysLeft: { other: "covering the # days remaining in this period" } as Forms,
    /** Before the credit in bold. */
    noCharge: "No charge. ",
    credit: "of unused {plan} time is credited to your upcoming bills",
    discount: "· covered by your discount",
    then: "Then",
    perMonth: "{price}/month",
    from: "from {date}",
    alerts: "Alerts",
    youHave: "· {n} saved",
    newestOff: "; your {n} newest pause",
    paidWith: "Paid with",
    exactNote: "Stripe bills the exact amount for the remaining time, which can differ by a few cents.",
    confirmPay: "Pay {amount} now",
    confirmUpgrade: "Confirm the upgrade",
    confirmSwitch: "Confirm the change",
    cancel: "Cancel",
    finishOnStripe: "Complete it on Stripe",
    close: "Close",
    cancelSub: "End subscription",
    cancelQ: "End your {plan} plan?",
    until: "Until {date}",
    /** {alerts}: "3 alerts" in bold (editor.alerts). */
    keepsWorking: "{plan} carries on: {alerts} running, unchanged.",
    after: "After",
    /** {notCharged}: notCharged in bold. */
    alertsStop: "Alerts pause and {notCharged}.",
    notCharged: "no further charges are made",
    yourAlerts: "Your alerts",
    staySaved: "Remain saved. They start again whenever you pick a plan.",
    keepPlan: "Keep the plan",
    notCancelled: "Cancellation did not go through. Retry in a minute.",
    notResumed: "The subscription is still cancelled. Retry in a minute.",
    continues: "{plan} stays active. Next charge {date}, {price}/month.",
    paymentFailed: "payment declined",
    onOf: "{on} of {limit} alerts running",
    overOff: " · {n} above the limit, paused",
    ends: " · stops {date}",
    renews: " · next charge {date}",
    /** {date}: the end date, in bold. */
    cancelled: "Cancelled. {plan} stops on {date}; alerts pause then and no further charges are made.",
    resume: "Restart subscription",
    savedOff: { one: "# alert saved, paused until a plan is active.", other: "# alerts saved, paused until a plan is active." } as Forms,
    startNow: "Alerts begin as soon as a plan is active.",
    /** After savedOff / startNow. */
    monthly: " Billed monthly, cancel anytime.",
    /** After the plan's name. */
    row: " · {price}/month for {limit} alerts",
    fitsYour: "covers your {n}",
    yourPlan: "Your plan",
    upgrade: "Move up",
    switch: "Move down",
    choose: "Choose {plan}",
    nowOn: "Current plan: {plan}, {limit} alerts.",
    cancelledUntil: "Cancelled. {plan} runs until {date}, with no further charges.",
    billing: "Billing and invoices",
    paidNote: "Moving up bills only the days remaining; moving down credits what is left.",
    checkoutNote: "Pay through Stripe by card or Link.",
  },

  /** The pricing page's plan buttons (PlanButton). */
  button: {
    onPlan: "✓ Current plan: {plan} · manage",
    yourPlan: "Current plan · manage",
  },
};
