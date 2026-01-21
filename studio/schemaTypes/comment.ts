import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'content',
      title: 'Comment',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().min(10).max(2000),
    }),
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{type: 'post'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parentComment',
      title: 'Reply To',
      type: 'reference',
      to: [{type: 'comment'}],
      description: 'If this is a reply, select the parent comment',
    }),
    defineField({
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      initialValue: false,
      description: 'Comments must be approved before they appear on the site',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      name: 'name',
      content: 'content',
      postTitle: 'post.title',
      approved: 'approved',
    },
    prepare(selection) {
      const {name, content, postTitle, approved} = selection
      const shortContent = content?.length > 50 ? content.substring(0, 50) + '...' : content
      return {
        title: `${approved ? '' : '[PENDING] '}${name}`,
        subtitle: `${shortContent} | Post: ${postTitle || 'Unknown'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
    {
      title: 'Pending First',
      name: 'pendingFirst',
      by: [
        {field: 'approved', direction: 'asc'},
        {field: 'createdAt', direction: 'desc'},
      ],
    },
  ],
})
