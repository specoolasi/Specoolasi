// OPTIONAL: extra fields for music records.
// Paste these inside the `fields: [ ... ]` list of your "work" document in the Sanity Studio.
// The website already reads them. If you skip this, records still work with title, artist (client), cover and link.

{ name: 'tag', title: 'Label (Original, Jingle, Sound design...)', type: 'string' },
{ name: 'year', title: 'Year', type: 'string' },
{ name: 'length', title: 'Length (e.g. 3:24)', type: 'string' },
{ name: 'description', title: 'Short description', type: 'text', rows: 3 },
{
  name: 'tracks', title: 'Tracklist (for an EP or album)', type: 'array',
  of: [{ type: 'object', fields: [
    { name: 'title', title: 'Song', type: 'string' },
    { name: 'length', title: 'Length', type: 'string' }
  ], preview: { select: { title: 'title', subtitle: 'length' } } }]
},
{ name: 'audio', title: 'Play preview (mp3)', type: 'file', options: { accept: 'audio/*' } },
