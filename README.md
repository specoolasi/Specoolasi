# Specoolasi website

A simple website (plain HTML, CSS and JavaScript, no build step). Blog posts come from Sanity. Accounts are edited in one file.

## What is in this folder

| Path | What it is |
| --- | --- |
| `index.html` | Home page |
| `blog.html` | Blog page (list of posts, and each single post) |
| `account.html` | Page for one managed account |
| `js/accounts.js` | **The list of accounts we manage. Edit this to add accounts.** |
| `js/config.js` | **Your Sanity Project ID goes here.** |
| `assets/logos/` | Put account logo images here |
| `sanity-schema/` | Two files for the Sanity writing screen (Part 3) |
| `css/style.css` | All colours, fonts and layout |

## Part 1: Put it on GitHub and Vercel

1. Create a new repository on github.com and upload everything in this folder to it.
2. On vercel.com, choose **Add New > Project**, pick that repository, and click **Deploy**. No settings need changing.
3. Every time you save a change on GitHub, Vercel updates the live site by itself in a minute or two.

To look at the site on your own computer, open a terminal in this folder and run `npx serve`.

## Part 2: Add or change accounts

1. Put the logo image in `assets/logos/` (square, about 200x200 px).
2. Open `js/accounts.js` on GitHub, click the pencil icon, copy one account block, and change the text and logo path.
3. Save ("Commit changes"). The site updates by itself.

## Part 3: Set up Sanity for the blog (one time)

You need Node.js installed on one computer for this part (nodejs.org).

1. **Create the writing screen.** In a terminal, inside this project folder, run:
   `npm create sanity@latest`
   Log in or create a Sanity account when asked. Choose: create a new project (name it "Specoolasi Blog"), dataset **production** with the default public access, output folder `studio`, template **Clean project with no predefined schema types**, and **JavaScript** (not TypeScript).
2. **Add the blog post type.** Copy `sanity-schema/post.js` and `sanity-schema/index.js` into `studio/schemaTypes/`, replacing the existing `index.js`.
3. **Publish the writing screen.** In a terminal, go into the `studio` folder and run `npx sanity deploy`. Pick a name. Sanity gives you an address like `yourname.sanity.studio`. Your team writes posts there.
4. **Copy your Project ID.** Find it on your project page at sanity.io/manage. Paste it into `js/config.js` in place of `YOUR_PROJECT_ID`, then commit the change on GitHub.
5. **Allow your website to read the posts.** In sanity.io/manage, open your project, go to the API settings, and add your website address (for example `https://your-site.vercel.app`, and your own domain later) as a **CORS origin**. Without this step the Blog page stays empty.
6. **Invite your team.** In the same project page, use the Members (or similar) section to invite each writer by email.

Do not upload the `studio/node_modules` folder to GitHub. The included `.gitignore` already skips it.

## How your team writes a post

1. Open your `yourname.sanity.studio` address and log in.
2. Click **Blog post**, then the new-document button.
3. Fill in the title, click **Generate** for the web address, add the author, pick a category, add tags (type a word and press Enter), add a cover image, a short summary, and the text.
4. Click **Publish**. The post appears on the Blog page within a short time. No code or GitHub needed.

## What the Blog page has

A "Blog" banner, big post cards (cover image, author, date, category, summary, Read more button), and a sidebar with search, recent posts, archives by month, categories and tags. Clicking any of those filters the list. Six posts show per page, then page numbers appear. There are no comments. The category list can be changed in `sanity-schema/post.js`.

## If something looks wrong

- **Blog says "not connected yet":** the Project ID in `js/config.js` is still `YOUR_PROJECT_ID`.
- **Blog says posts could not be loaded:** check the CORS origin (step 5) and that the post is Published, not just saved as a draft.
- **A change broke the site:** in Vercel, open the Deployments list and promote an earlier deployment.

## Still to change

- The contact email in `index.html` is a placeholder (`hello@specoolasi.com`).
- The Projects section says "coming soon".
- The logo on the site is a vector redraw. Your original files are in `assets/brand/`.
