// ACCOUNTS MANAGED BY SPECOOLASI
// To add an account: copy one block, paste it below (add a comma between blocks), and change the text.
//
//   id       lowercase letters, numbers and hyphens only (used in the page address)
//   name     the account name
//   logo     put the image in assets/logos/ and write its path. Leave '' to show the first letter.
//   theme    the look of the account page: pop, football, news, magazine, cinema, club, quotes or podcast. Leave it out for the standard look.
//   desc     one or two sentences about the account. Leave '' to hide.
//   socials  the social media the account is on. Each one needs:
//              type    instagram, tiktok, youtube, x, facebook, threads, telegram, or whatsapp
//              handle  the username WITHOUT the @ (for whatsapp: the phone number with country code, digits only)
//            The page shows only the social media logo, and a "Message" button that opens the DM.
//            Optional: url: 'https://...' if the profile address is different from the usual one.
//   samples  content samples. Put the images in assets/accounts/<id>/ and list them. Each one needs:
//              img     the image path, e.g. 'assets/accounts/popthusiast/1.jpg'
//              link    optional: the post address to open when someone clicks the image
//              title   optional: a short caption shown under the image
//            These samples also appear on the Social media service page, when someone taps this account's logo.
//            Leave [] to hide the section.
//
// Example (copy the shape, not the words):
//   { id: 'my-account', name: 'My Account', logo: 'assets/logos/my-account.png',
//     desc: 'Daily pop culture news and memes.',
//     socials: [ { type: 'instagram', handle: 'myaccount' }, { type: 'tiktok', handle: 'myaccount' } ],
//     samples: [ { img: 'assets/accounts/my-account/1.jpg', link: 'https://www.instagram.com/p/XXXX/' } ] }

var ACCOUNTS = [
  { id: 'popthusiast', name: 'Popthusiast', logo: 'assets/logos/popthusiast.jpg', theme: 'pop', desc: 'Edits of your favorite K-pop girl idols.', socials: [], samples: [] },
  { id: 'ketahui-id',  name: 'Ketahui.id',  logo: 'assets/logos/ketahui-id.png',  theme: 'news', desc: 'Indonesian news updates.', socials: [], samples: [] },
  { id: 'globall-id',  name: 'Globall_id',  logo: 'assets/logos/globall-id.png',  theme: 'football', desc: 'Football news from all around the world.', socials: [], samples: [] },
  { id: 'popnewsiast', name: 'Popnewsiast', logo: 'assets/logos/popnewsiast.png', theme: 'magazine', desc: 'Music news from all around the world.', socials: [], samples: [] },
  { id: 'dramories',   name: 'Dramories',   logo: 'assets/logos/dramories.png',   theme: 'cinema', desc: 'Clips and edits from Korean movies and series, with films and series from around the world to come.', socials: [], samples: [] },
  { id: 'listenation', name: 'Listenation', logo: 'assets/logos/listenation.png', theme: 'club', desc: 'EDM and music recommendations.', socials: [], samples: [] },
  { id: 'gloome',      name: 'Gloome',      logo: 'assets/logos/gloome.png',      theme: 'quotes', desc: 'Relatable quotes.', socials: [], samples: [] },
  { id: 'clippods-id', name: 'Clippods.id', logo: 'assets/logos/clippods-id.png', theme: 'podcast', desc: 'Clips from Indonesian content creator podcasts.', socials: [], samples: [] }
];
