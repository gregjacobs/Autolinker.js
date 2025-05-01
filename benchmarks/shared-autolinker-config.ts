export const sharedAutolinkerConfig = {
    // Config that we'll use for all Autolinker versions, and that we'll try
    // to set up other libraries to do the same functionality (where applicable)
    urls: true,
    email: true,
    mention: 'twitter',
    hashtag: 'twitter',
    // phone: true,  -- anchorme.js and linkifyjs are the closest in performance to Autolinker, but neither support phone numbers
} as const; // as const to make this config object compatible between the most versions rather than using a specific version's AutolinkerConfig type
