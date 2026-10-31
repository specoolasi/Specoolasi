import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Web address (click Generate)',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (r) => r.required(),
    }),
    defineField({name: 'author', title: 'Author', type: 'string'}),
    defineField({
      name: 'publishedAt',
      title: 'Publish date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({name: 'coverImage', title: 'Cover image', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'excerpt',
      title: 'Short summary (shown on the Blog page)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'array',
      of: [
        {type: 'block'},
        {type: 'image', fields: [{name: 'alt', type: 'string', title: 'Image description'}]},
      ],
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'author', media: 'coverImage'}},
})
