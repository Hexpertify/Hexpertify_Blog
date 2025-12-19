# Admin Panel Guide

## Overview

This admin panel allows you to manage all blog content for the Hexpertify blog platform. The panel includes an MDX editor for creating rich blog posts with formatting, images, and links.

## Access Information

**Admin Login URL**: `/admin/login`

**Credentials**:
- Email: `admin@hexpertify.com`
- Password: `blog@hexpertify.build`

## Features

### 1. Dashboard (`/admin/dashboard`)
- View all blog posts at a glance
- See statistics (total posts, published posts, draft posts)
- Quick actions to publish/unpublish, edit, or delete posts
- Visual preview with thumbnails

### 2. All Posts (`/admin/posts`)
- Complete list of all blog posts
- Search functionality to find posts quickly
- Filter by category (AI, Mental Health, Fitness, Career, Cloud, Technology)
- Filter by status (Published, Draft)
- Bulk management capabilities

### 3. Create New Post (`/admin/posts/new`)
- Rich MDX editor with preview mode
- Formatting toolbar (bold, italic, headings, lists, links, images, code)
- Auto-generated slug from title
- Category selection
- Author customization
- Featured image URL
- Read time estimation
- Publish immediately or save as draft

### 4. Edit Post (`/admin/posts/edit/[id]`)
- Edit existing posts with the same features as new post creation
- Update content, metadata, and publication status

## MDX Editor

The MDX editor supports markdown syntax with the following features:

### Formatting Options

- **Bold**: `**text**` or use the Bold button
- *Italic*: `*text*` or use the Italic button
- Headings: `## Heading` or use the Heading button
- Lists: `- item` or use the List button
- Links: `[text](url)` or use the Link button
- Images: `![alt](url)` or use the Image button
- Code: `` `code` `` or use the Code button

### Preview Mode

Switch to the Preview tab to see how your content will appear on the blog.

## Database Structure

The admin panel uses Supabase with the following tables:

### `blog_posts`
- `id`: Unique identifier
- `title`: Post title
- `slug`: URL-friendly identifier
- `description`: Short description
- `content`: MDX content
- `author`: Author name
- `category`: Post category
- `image_url`: Featured image URL
- `read_time`: Estimated reading time
- `published`: Publication status
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### `admin_users`
- `id`: Unique identifier
- `email`: Admin email
- `password_hash`: Encrypted password
- `created_at`: Creation timestamp

## Security

- Row Level Security (RLS) is enabled on all tables
- Public users can only read published posts
- Admin authentication required for all management operations
- Session-based authentication using browser sessionStorage

## Best Practices

1. **Images**: Always use valid Pexels URLs for images
2. **Slugs**: Keep slugs short, descriptive, and URL-friendly
3. **Descriptions**: Write clear, concise descriptions (150-200 characters)
4. **Content**: Use proper MDX formatting for better readability
5. **Categories**: Choose the most relevant category for your post
6. **Publishing**: Review posts in preview mode before publishing

## Troubleshooting

### Cannot Login
- Verify you're using the correct credentials
- Clear browser cache and cookies
- Check if sessionStorage is enabled in your browser

### Posts Not Appearing
- Ensure posts are marked as "Published"
- Check if the slug is unique
- Verify the image URL is valid and accessible

### Editor Issues
- If preview doesn't update, switch tabs to refresh
- For complex formatting, check MDX syntax
- Ensure all markdown tags are properly closed

## Environment Variables

Make sure your `.env` file (or hosting provider env settings) includes at least:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=cheliyan-sankar
GITHUB_REPO=Hexpertify_Blog
GITHUB_BRANCH=main
GITHUB_ASSETS_PATH_PREFIX=assets/uploads
```

These are used by:
- Newsletter / subscriber API (server-side, Supabase)
- Content editing (posts, FAQs, SEO) via GitHub commits
- Image uploads from the admin (stored in GitHub and served via raw URLs)

## Support

For technical issues or feature requests, contact the development team.
