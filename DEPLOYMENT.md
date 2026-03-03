# HOURA Deployment Guide 🚀

HOURA is ready to go global! Since you're using Next.js, the best and easiest platform to host your site is **Vercel**.

## Step 1: Push your code to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Connect your local project to GitHub and push your code.
   ```bash
   git init
   git add .
   git commit -m "Initialize HOURA"
   git branch -M main
   git remote add origin https://github.com/[your-username]/gem.git
   git push -u origin main
   ```

## Step 2: Connect to Vercel
1. Go to [Vercel](https://vercel.com) and sign in with GitHub.
2. Click **Add New** > **Project**.
3. Import your `gem` repository.

## Step 3: Configure Environment Variables
Inside the Vercel deployment settings, add the following variables from your `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (Set this to your Vercel URL, e.g., `https://houra.vercel.app`)

## Step 4: Deploy!
Click **Deploy**. In less than a minute, HOURA will be live at a professional URL!

---

## Growth Tips for HOURA 📈
1. **Share on Social Media**: Use the OpenGraph preview to share professional-looking links on Twitter, LinkedIn, and Instagram.
2. **Product Hunt**: Launch on Product Hunt to get initial traction.
3. **Local Communities**: Share the link in university or local neighborhood groups.
