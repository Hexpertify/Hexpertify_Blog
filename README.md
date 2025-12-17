# Hexpertify Blog Platform

A modern, file-based blog platform built with Next.js, featuring an admin panel for easy content management. Blog posts are stored as MDX files for version control and portability.

## Features

- MDX-based blog post storage
- Rich admin panel with visual editor
- Markdown/MDX support with live preview
- Category and tag management
- Table of contents generation
- Author profiles with social links
- Publish/unpublish workflow
- Search and filter functionality
- **Complete SEO management system**
  - Meta tags configuration
  - Open Graph tags for social sharing
  - Twitter Card tags
  - Per-page SEO customization
  - File-based SEO storage
- FAQ management system
- Responsive design
- SEO-friendly

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Content**: MDX + Gray Matter
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd project

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the blog.


## Project Structure

```
project/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   ├── blog/[slug]/       # Blog post pages
│   └── admin/             # Admin panel
│       ├── dashboard/     # Dashboard
│       ├── posts/         # Post management
│       ├── faqs/          # FAQ management
│       ├── categories/    # Category management
│       ├── seo/           # SEO management
│       └── login/         # Admin login
├── components/            # React components
│   ├── blog/             # Blog components
│   ├── admin/            # Admin components
│   └── ui/               # UI components (shadcn)
├── content/              # Content files
│   ├── posts/           # Blog posts (MDX)
│   ├── faqs/            # FAQ files (MDX)
│   ├── seo/             # SEO metadata (JSON)
│   └── categories.json  # Categories list
├── lib/                  # Utility functions
│   ├── mdx.ts           # MDX file operations
│   ├── faqs.ts          # FAQ operations
│   ├── seo.ts           # SEO operations
│   ├── actions.ts       # Server actions
│   └── auth.ts          # Authentication
└── public/              # Static assets

```

## Content Management

### Creating Blog Posts

1. Login to admin panel
2. Click "New Post"
3. Fill in post details:
   - Title (auto-generates slug)
   - Description
   - Category
   - Author information
   - Featured image URL
   - Content (MDX format)
4. Add table of contents items (optional)
5. Click "Create Post"

### MDX Format

Posts are stored in `content/posts/` as `.mdx` files:

```mdx
---
title: Your Post Title
slug: your-post-slug
description: Post description
author: Author Name
category: AI
imageUrl: https://images.pexels.com/...
published: true
date: '2024-01-15'
---

Your markdown content here...
```

See `MDX_MIGRATION_GUIDE.md` for detailed format specification.

## Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Utilities
npm run lint         # Run ESLint
npm run typecheck    # Type checking
```

## Admin Features

### Dashboard
- Overview of all posts
- Quick stats (total, published, drafts)
- Quick actions (edit, delete, publish/unpublish)

### Post Editor
- MDX editor with formatting toolbar
- Live preview
- Auto-slug generation
- Category selection
- Author customization
- Table of contents builder
- Image URL input

### Post Management
- Search posts
- Filter by category
- Filter by status (published/draft)
- Bulk operations

### SEO Management
- Configure meta tags for all pages
- Open Graph tags for social sharing (Facebook, LinkedIn)
- Twitter Card configuration
- Per-page SEO customization
- Quick access to common pages
- Preview-friendly descriptions and character limits
- File-based storage for version control
- See `SEO_GUIDE.md` for detailed documentation

### FAQ Management
- Create and edit FAQs
- Assign FAQs to specific pages or homepage
- Category organization
- Display order control
- Publish/unpublish workflow

### Category Management
- Add/remove blog categories
- System-wide category updates

## Deployment

### Netlify

The project includes Netlify configuration (`netlify.toml`):

```bash
# Build the project
npm run build

# Deploy to Netlify
# Push to Git and connect to Netlify
```

### Environment Variables

No environment variables required! The system uses file-based storage.

## Customization

### Styling

- Edit `tailwind.config.ts` for theme customization
- Modify `app/globals.css` for global styles
- Component styles use Tailwind utility classes

### Categories

Update category lists in:
- `app/page.tsx` (homepage filter)
- `app/admin/posts/new/page.tsx` (create post form)
- `app/admin/posts/edit/[slug]/page.tsx` (edit post form)

### Authentication

Current implementation uses simple session-based auth. To modify:
- Edit `lib/auth.ts` for auth logic
- Update credentials in `app/admin/login/page.tsx`

## Documentation

- `ADMIN_GUIDE.md` - Comprehensive admin panel guide
- `MDX_MIGRATION_GUIDE.md` - MDX system documentation

## Sample Posts

Three sample posts are included:
1. Getting Started with Cloud Computing
2. The AI Revolution in 2024
3. Prioritizing Mental Health in Tech

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit with descriptive messages
5. Push and create a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues:
- Check documentation in `ADMIN_GUIDE.md`
- Review `MDX_MIGRATION_GUIDE.md` for technical details
- Contact the development team

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
