import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          {title: 'English', value: 'en'},
          {title: 'Hindi', value: 'hi'},
          {title: 'Tamil', value: 'ta'},
          {title: 'Telugu', value: 'te'},
          {title: 'Bengali', value: 'bn'},
          {title: 'Marathi', value: 'mr'},
          {title: 'Gujarati', value: 'gu'},
          {title: 'Kannada', value: 'kn'},
          {title: 'Malayalam', value: 'ml'},
          {title: 'Punjabi', value: 'pa'},
        ],
      },
      initialValue: 'en',
      description: 'Language of this blog post',
    }),
    defineField({
      name: 'linkedPost',
      title: 'Linked Translation',
      type: 'reference',
      to: [{type: 'post'}],
      description: 'Link to the same post in another language (for hreflang SEO)',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body (HTML)',
      type: 'text',
      rows: 20,
      description: 'Full blog content in HTML format',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      description: 'Short summary for previews (150-200 words)',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Published', value: 'published'},
        ],
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'object',
      fields: [
        {
          name: 'url',
          title: 'URL',
          type: 'url',
          description: 'Image URL from Unsplash, Pexels, or Pixabay',
        },
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Descriptive alt text for SEO',
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Under 60 characters',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          description: '150-160 characters with keyword and CTA',
        },
        {
          name: 'focusKeyword',
          title: 'Focus Keyword',
          type: 'string',
          description: 'Primary keyword for this post',
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{type: 'string'}],
          description: 'Related keywords for SEO',
        },
      ],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
    }),
    defineField({
      name: 'internalLinks',
      title: 'Internal Links',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Internal page paths (e.g., /tools/kundli-calculator)',
    }),
    defineField({
      name: 'externalLinks',
      title: 'External Links',
      type: 'array',
      of: [{type: 'url'}],
      description: 'External reference URLs',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      status: 'status',
      language: 'language',
    },
    prepare(selection) {
      const {title, author, status, language} = selection
      const langLabel = language ? language.toUpperCase() : 'EN'
      return {
        title: `[${langLabel}] ${title}`,
        subtitle: `${status === 'published' ? 'Published' : 'Draft'} | ${author || 'No author'}`,
      }
    },
  },
})
