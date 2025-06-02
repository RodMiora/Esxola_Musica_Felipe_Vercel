module.exports = {
  images: {
    domains: ['localhost', 'source.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true // Adicione esta linha se estiver usando SSG
  }
}

I see you're encountering an error with the Next.js Image component. The error message indicates that you're trying to use images from `source.unsplash.com`, but this domain isn't properly configured in your Next.js configuration.

Looking at your existing `next.config.js` file, I can see that you already have the domain listed in the configuration: