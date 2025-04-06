import fetch from 'node-fetch';

async function login() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser2',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    console.log('Login status:', response.status);
    return data.access_token;
  } catch (error) {
    console.error('Error during login:', error);
    return null;
  }
}

async function fetchBlogPosts(token) {
  try {
    const response = await fetch('http://localhost:5000/api/cms/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('CMS Posts API status:', response.status);
    console.log('CMS Posts data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }
}

async function fetchPublicBlogPosts() {
  try {
    const response = await fetch('http://localhost:5000/api/cms/blog', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    console.log('Public Blog API status:', response.status);
    console.log('Public Blog data structure:', JSON.stringify(data, null, 2));
    
    if (data.posts && data.posts.length > 0) {
      const firstPost = data.posts[0];
      console.log('First blog post structure:', JSON.stringify(firstPost, null, 2));
      
      // Check where the title might be located
      if (firstPost.translations && firstPost.translations.length > 0) {
        console.log('First blog post title from translations:', firstPost.translations[0].title);
      } else {
        console.log('No translations found in first post');
      }
    } else {
      console.log('No posts found or posts array is empty');
    }
  } catch (error) {
    console.error('Error fetching public blog posts:', error);
  }
}

async function fetchBlogPostDetail(slug) {
  try {
    const response = await fetch(`http://localhost:5000/api/cms/blog/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`Blog post detail API status for slug "${slug}":`, response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('Blog post detail data structure:', Object.keys(data));
      console.log('Post details:', Object.keys(data.post));
      console.log('Post title:', data.post.title);
      console.log('Has content:', Boolean(data.post.content));
      console.log('Content snippet:', data.post.content?.substring(0, 100) + '...');
      console.log('Available languages:', data.available_languages);
      console.log('Related posts count:', data.related_posts.length);
    } else {
      const data = await response.json();
      console.log('Error response:', data);
    }
  } catch (error) {
    console.error('Error fetching blog post detail:', error);
  }
}

async function testCMS() {
  const token = await login();
  if (token) {
    console.log('Successfully logged in, testing CMS API...');
    await fetchBlogPosts(token);
    await fetchPublicBlogPosts();
    
    // Test blog post detail endpoint with a specific slug
    await fetchBlogPostDetail('ai-image-processing-future-trends');
  } else {
    console.error('Failed to login, cannot test CMS API');
  }
}

testCMS();