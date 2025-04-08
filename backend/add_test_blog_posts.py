"""
Script to add sample blog posts through the Flask API
"""
import os
import sys
import json
import requests
from datetime import datetime
import time

# API URL
API_URL = "http://localhost:5000/api"

def login():
    """Login and get access token"""
    response = requests.post(f"{API_URL}/auth/login", json={
        "username": "testuser2",
        "password": "password123"
    })
    
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        sys.exit(1)
    
    data = response.json()
    return data.get('access_token')

def create_tags(token, tags):
    """Create tags if they don't exist"""
    headers = {'Authorization': f'Bearer {token}'}
    tag_objects = {}
    
    # Get existing tags
    response = requests.get(f"{API_URL}/cms/tags")
    if response.status_code == 200:
        existing_tags = response.json()
        for tag in existing_tags:
            tag_objects[tag['name']] = tag['id']
    
    # Create new tags
    for tag_name in tags:
        if tag_name in tag_objects:
            print(f"Tag already exists: {tag_name}")
            continue
        
        # Generate slug
        slug = tag_name.lower().replace(' ', '-')
        
        response = requests.post(
            f"{API_URL}/cms/tags", 
            headers=headers,
            json={"name": tag_name, "slug": slug}
        )
        
        if response.status_code == 201:
            tag_id = response.json().get('id')
            tag_objects[tag_name] = tag_id
            print(f"Created tag: {tag_name} (ID: {tag_id})")
        else:
            print(f"Failed to create tag {tag_name}: {response.text}")
    
    return tag_objects

def ensure_language_exists(token, code="en", name="English"):
    """Ensure language exists"""
    headers = {'Authorization': f'Bearer {token}'}
    
    # Check if language exists
    response = requests.get(f"{API_URL}/cms/languages")
    if response.status_code == 200:
        languages = response.json()
        for lang in languages:
            if lang['code'] == code:
                print(f"Language exists: {name} ({code})")
                return lang
    
    # Create language
    response = requests.post(
        f"{API_URL}/cms/languages",
        headers=headers,
        json={"code": code, "name": name, "is_default": True, "is_active": True}
    )
    
    if response.status_code == 201:
        print(f"Created language: {name} ({code})")
        return response.json()
    else:
        print(f"Failed to create language: {response.text}")
        return None

def add_sample_blog_posts(token):
    """Add sample blog posts"""
    headers = {'Authorization': f'Bearer {token}'}
    
    # Sample blog posts
    blog_posts = [
        {
            "slug": "ai-background-removal-guide",
            "featured_image": "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=1036&auto=format&fit=crop",
            "tags": ["AI Technology", "Background Removal", "Design Tips"],
            "translations": [
                {
                    "language_code": "en",
                    "title": "The Ultimate Guide to AI Background Removal",
                    "content": """
<h1>The Ultimate Guide to AI Background Removal</h1>

<p>Background removal is a fundamental task in image editing that has been transformed by artificial intelligence. This guide covers everything you need to know about using AI for professional background removal.</p>

<h2>What is AI Background Removal?</h2>

<p>AI background removal uses machine learning algorithms to automatically detect and separate the subject of an image from its background. Unlike traditional methods that require manual selection and masking, AI-powered tools can identify complex edges and intricate details with minimal user input.</p>

<h2>Benefits of AI Background Removal</h2>

<ul>
  <li>Speed: Process images in seconds rather than minutes or hours</li>
  <li>Accuracy: Handle complex edges like hair and semi-transparent objects</li>
  <li>Consistency: Achieve uniform results across large batches of images</li>
  <li>Accessibility: No advanced Photoshop skills required</li>
</ul>

<h2>Common Use Cases</h2>

<h3>E-commerce Product Photography</h3>
<p>Online retailers use background removal to create clean, consistent product images that help increase conversion rates. Transparent backgrounds allow products to be placed on different colored backgrounds or in contextual scenes.</p>

<h3>Marketing and Advertising</h3>
<p>Creative professionals need to quickly extract subjects to create compelling visual content for campaigns across multiple channels and formats.</p>

<h3>Graphic Design</h3>
<p>Designers frequently need to isolate elements from source images to incorporate them into new compositions, illustrations, or mockups.</p>

<h2>Best Practices for AI Background Removal</h2>

<p>Even with advanced AI tools, following these practices will help you achieve the best results:</p>

<ol>
  <li>Use good lighting when capturing original images</li>
  <li>Ensure sufficient contrast between subject and background</li>
  <li>Review and make minor adjustments to AI results when necessary</li>
  <li>Export in appropriate formats (PNG for transparency preservation)</li>
</ol>

<h2>Conclusion</h2>

<p>AI background removal technology has democratized what was once a specialized skill, enabling anyone to achieve professional-quality results. Whether you're running an e-commerce store, creating marketing materials, or just improving personal photos, these tools can save time while delivering outstanding results.</p>
                    """,
                    "meta_title": "The Ultimate Guide to AI Background Removal | iMagenWiz",
                    "meta_description": "Learn everything about AI background removal, from basic concepts to advanced techniques. Perfect for designers, marketers and e-commerce professionals.",
                    "meta_keywords": "AI background removal, image editing, transparent background, e-commerce photography"
                },
                {
                    "language_code": "fr",
                    "title": "Le Guide Ultime de la Suppression d'Arrière-plan par IA",
                    "content": """
<h1>Le Guide Ultime de la Suppression d'Arrière-plan par IA</h1>

<p>La suppression d'arrière-plan est une tâche fondamentale de l'édition d'image qui a été transformée par l'intelligence artificielle. Ce guide couvre tout ce que vous devez savoir sur l'utilisation de l'IA pour une suppression professionnelle des arrière-plans.</p>

<h2>Qu'est-ce que la Suppression d'Arrière-plan par IA?</h2>

<p>La suppression d'arrière-plan par IA utilise des algorithmes d'apprentissage automatique pour détecter et séparer automatiquement le sujet d'une image de son arrière-plan. Contrairement aux méthodes traditionnelles qui nécessitent une sélection et un masquage manuels, les outils alimentés par l'IA peuvent identifier des contours complexes et des détails complexes avec une intervention minimale de l'utilisateur.</p>

<h2>Avantages de la Suppression d'Arrière-plan par IA</h2>

<ul>
  <li>Rapidité: Traitement des images en quelques secondes plutôt qu'en minutes ou heures</li>
  <li>Précision: Gestion des contours complexes comme les cheveux et les objets semi-transparents</li>
  <li>Cohérence: Résultats uniformes sur de grands lots d'images</li>
  <li>Accessibilité: Aucune compétence avancée de Photoshop requise</li>
</ul>

<h2>Cas d'Utilisation Courants</h2>

<h3>Photographie de Produits E-commerce</h3>
<p>Les détaillants en ligne utilisent la suppression d'arrière-plan pour créer des images de produits propres et cohérentes qui aident à augmenter les taux de conversion. Les arrière-plans transparents permettent de placer les produits sur différents fonds colorés ou dans des scènes contextuelles.</p>

<h3>Marketing et Publicité</h3>
<p>Les professionnels de la création doivent rapidement extraire des sujets pour créer du contenu visuel convaincant pour des campagnes sur plusieurs canaux et formats.</p>

<h3>Design Graphique</h3>
<p>Les designers ont souvent besoin d'isoler des éléments d'images sources pour les incorporer dans de nouvelles compositions, illustrations ou maquettes.</p>

<h2>Meilleures Pratiques pour la Suppression d'Arrière-plan par IA</h2>

<p>Même avec des outils d'IA avancés, suivre ces pratiques vous aidera à obtenir les meilleurs résultats:</p>

<ol>
  <li>Utilisez un bon éclairage lors de la capture des images originales</li>
  <li>Assurez un contraste suffisant entre le sujet et l'arrière-plan</li>
  <li>Révisez et apportez des ajustements mineurs aux résultats de l'IA si nécessaire</li>
  <li>Exportez dans des formats appropriés (PNG pour la préservation de la transparence)</li>
</ol>

<h2>Conclusion</h2>

<p>La technologie de suppression d'arrière-plan par IA a démocratisé ce qui était autrefois une compétence spécialisée, permettant à chacun d'obtenir des résultats de qualité professionnelle. Que vous gériez une boutique e-commerce, créiez des supports marketing ou amélioriez simplement des photos personnelles, ces outils peuvent vous faire gagner du temps tout en offrant des résultats exceptionnels.</p>
                    """,
                    "meta_title": "Le Guide Ultime de la Suppression d'Arrière-plan par IA | iMagenWiz",
                    "meta_description": "Apprenez tout sur la suppression d'arrière-plan par IA, des concepts de base aux techniques avancées. Parfait pour les designers, marketeurs et professionnels du e-commerce.",
                    "meta_keywords": "suppression d'arrière-plan IA, édition d'image, fond transparent, photographie e-commerce"
                }
            ]
        },
        {
            "slug": "ecommerce-product-photography-tips",
            "featured_image": "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=1050&auto=format&fit=crop",
            "tags": ["E-commerce", "Product Photography", "Marketing Tips"],
            "translations": [
                {
                    "language_code": "en",
                    "title": "10 Essential E-commerce Product Photography Tips",
                    "content": """
<h1>10 Essential E-commerce Product Photography Tips</h1>

<p>High-quality product photography is crucial for e-commerce success. In fact, 75% of online shoppers rely on product photos when deciding whether to make a purchase. This guide covers ten essential tips to help you create professional product images that convert browsers into buyers.</p>

<h2>1. Use Proper Lighting</h2>

<p>Lighting is perhaps the most important factor in product photography. Poor lighting can make even the best products look unprofessional or unappealing.</p>

<p><strong>Best practices:</strong></p>
<ul>
  <li>Use natural light when possible - photograph near a large window with diffused sunlight</li>
  <li>For consistent results, invest in a basic lighting setup with softboxes</li>
  <li>Avoid harsh direct lighting that creates strong shadows</li>
  <li>Use reflectors to fill in shadows and create even lighting</li>
</ul>

<h2>2. Maintain Consistent Background</h2>

<p>A clean, consistent background across your product catalog creates a professional, cohesive look for your store.</p>

<p><strong>Options include:</strong></p>
<ul>
  <li>Pure white backgrounds (the standard for most e-commerce platforms)</li>
  <li>Light gray or neutral backgrounds</li>
  <li>Contextual backgrounds that show the product in use</li>
</ul>

<p>For maximum flexibility, photograph on white and then use AI background removal to create transparent PNGs.</p>

<h2>3. Shoot from Multiple Angles</h2>

<p>Since customers can't physically handle products, providing multiple views helps them make informed decisions.</p>

<p><strong>Essential angles include:</strong></p>
<ul>
  <li>Front view</li>
  <li>Side view</li>
  <li>Back view</li>
  <li>Top view</li>
  <li>Close-ups of important details or features</li>
</ul>

<h2>4. Include Scale Reference</h2>

<p>Online shoppers often struggle to gauge the actual size of products from photos alone.</p>

<p><strong>Solutions:</strong></p>
<ul>
  <li>Include a common object for size reference</li>
  <li>Show the product in use</li>
  <li>Include a ruler or measurement reference in one of your images</li>
</ul>

<h2>5. Optimize Image Quality and File Size</h2>

<p>Your images need to be high-quality but also load quickly to prevent abandoned carts.</p>

<p><strong>Guidelines:</strong></p>
<ul>
  <li>Shoot in RAW format when possible</li>
  <li>Edit images at full resolution</li>
  <li>Export web-optimized versions (typically 1500-2500px on longest side)</li>
  <li>Compress images appropriately (JPEG for standard photos, PNG for transparent backgrounds)</li>
  <li>Aim for file sizes under 200KB while maintaining quality</li>
</ul>

<h2>6. Use a Tripod</h2>

<p>A stable camera produces sharper images and ensures consistency across product shots.</p>

<p><strong>Benefits:</strong></p>
<ul>
  <li>Eliminates camera shake, especially important in lower light</li>
  <li>Maintains consistent framing and perspective</li>
  <li>Allows for longer exposures if needed</li>
  <li>Frees your hands to adjust the product or reflectors</li>
</ul>

<h2>7. Edit Photos Professionally</h2>

<p>Post-processing is essential for creating professional-quality product images.</p>

<p><strong>Basic editing steps:</strong></p>
<ul>
  <li>Correct white balance for accurate color representation</li>
  <li>Adjust exposure and contrast</li>
  <li>Remove dust spots or imperfections</li>
  <li>Crop and align images consistently</li>
  <li>Remove backgrounds if using transparent PNGs</li>
</ul>

<h2>8. Show Products in Context</h2>

<p>While clean, isolated product shots are essential, showing products in use helps customers envision them in their own lives.</p>

<p><strong>Ideas for contextual shots:</strong></p>
<ul>
  <li>Lifestyle photos showing the product being used</li>
  <li>Scale demonstrations with recognizable objects</li>
  <li>Grouping related products together</li>
</ul>

<h2>9. Display Product Variations</h2>

<p>If your product comes in multiple colors, sizes, or variations, show them all.</p>

<p><strong>Best practices:</strong></p>
<ul>
  <li>Photograph each color variant individually</li>
  <li>Create consistent composition across variants</li>
  <li>Consider group shots showing all available options together</li>
</ul>

<h2>10. Maintain Brand Consistency</h2>

<p>Your product photography should reflect your brand's visual identity.</p>

<p><strong>Tips for brand consistency:</strong></p>
<ul>
  <li>Develop a photography style guide</li>
  <li>Use consistent lighting, angles, and composition</li>
  <li>Apply your brand's color palette in backgrounds or props where appropriate</li>
  <li>Edit photos with a consistent style</li>
</ul>

<h2>Conclusion</h2>

<p>Professional product photography doesn't necessarily require expensive equipment - just careful attention to detail and consistent application of these principles. By implementing these ten tips, you'll create product images that not only look professional but also help increase conversion rates and reduce return rates by setting accurate expectations.</p>

<p>Remember that great product photography is an investment that pays dividends through improved conversion rates and reduced returns. Whether you're doing it yourself or hiring a professional, prioritizing image quality is one of the smartest investments you can make in your e-commerce business.</p>
                    """,
                    "meta_title": "10 Essential E-commerce Product Photography Tips | iMagenWiz",
                    "meta_description": "Learn 10 professional product photography techniques to increase your e-commerce conversion rates and create stunning product images that sell.",
                    "meta_keywords": "product photography, e-commerce, product images, conversion rate optimization, online store photography"
                },
                {
                    "language_code": "fr",
                    "title": "10 Conseils Essentiels pour la Photographie de Produits E-commerce",
                    "content": """
<h1>10 Conseils Essentiels pour la Photographie de Produits E-commerce</h1>

<p>Une photographie de produits de haute qualité est cruciale pour le succès du e-commerce. En fait, 75% des acheteurs en ligne s'appuient sur les photos de produits pour décider s'ils effectuent un achat. Ce guide couvre dix conseils essentiels pour vous aider à créer des images de produits professionnelles qui convertissent les visiteurs en acheteurs.</p>

<h2>1. Utilisez un Éclairage Approprié</h2>

<p>L'éclairage est peut-être le facteur le plus important en photographie de produits. Un mauvais éclairage peut faire paraître même les meilleurs produits non professionnels ou peu attrayants.</p>

<p><strong>Meilleures pratiques:</strong></p>
<ul>
  <li>Utilisez la lumière naturelle quand c'est possible - photographiez près d'une grande fenêtre avec la lumière du soleil diffuse</li>
  <li>Pour des résultats constants, investissez dans une installation d'éclairage de base avec des softbox</li>
  <li>Évitez l'éclairage direct dur qui crée des ombres fortes</li>
  <li>Utilisez des réflecteurs pour combler les ombres et créer un éclairage uniforme</li>
</ul>

<h2>2. Maintenez un Arrière-plan Cohérent</h2>

<p>Un arrière-plan propre et cohérent dans votre catalogue de produits crée un aspect professionnel et cohésif pour votre boutique.</p>

<p><strong>Les options incluent:</strong></p>
<ul>
  <li>Arrière-plans blanc pur (la norme pour la plupart des plateformes e-commerce)</li>
  <li>Arrière-plans gris clair ou neutres</li>
  <li>Arrière-plans contextuels qui montrent le produit en utilisation</li>
</ul>

<p>Pour une flexibilité maximale, photographiez sur fond blanc puis utilisez la suppression d'arrière-plan par IA pour créer des PNG transparents.</p>

<h2>3. Photographiez sous Plusieurs Angles</h2>

<p>Puisque les clients ne peuvent pas manipuler physiquement les produits, fournir plusieurs vues les aide à prendre des décisions éclairées.</p>

<p><strong>Les angles essentiels incluent:</strong></p>
<ul>
  <li>Vue de face</li>
  <li>Vue latérale</li>
  <li>Vue arrière</li>
  <li>Vue de dessus</li>
  <li>Gros plans de détails ou caractéristiques importantes</li>
</ul>

<h2>4. Incluez une Référence d'Échelle</h2>

<p>Les acheteurs en ligne ont souvent du mal à évaluer la taille réelle des produits à partir des seules photos.</p>

<p><strong>Solutions:</strong></p>
<ul>
  <li>Incluez un objet commun comme référence de taille</li>
  <li>Montrez le produit en utilisation</li>
  <li>Incluez une règle ou une référence de mesure dans l'une de vos images</li>
</ul>

<h2>5. Optimisez la Qualité de l'Image et la Taille du Fichier</h2>

<p>Vos images doivent être de haute qualité mais aussi se charger rapidement pour éviter les abandons de panier.</p>

<p><strong>Directives:</strong></p>
<ul>
  <li>Photographiez en format RAW si possible</li>
  <li>Éditez les images en pleine résolution</li>
  <li>Exportez des versions optimisées pour le web (généralement 1500-2500px sur le côté le plus long)</li>
  <li>Compressez les images de manière appropriée (JPEG pour les photos standard, PNG pour les arrière-plans transparents)</li>
  <li>Visez des tailles de fichier inférieures à 200Ko tout en maintenant la qualité</li>
</ul>

<h2>6. Utilisez un Trépied</h2>

<p>Un appareil photo stable produit des images plus nettes et assure la cohérence entre les prises de vue de produits.</p>

<p><strong>Avantages:</strong></p>
<ul>
  <li>Élimine les tremblements de l'appareil, particulièrement important en faible luminosité</li>
  <li>Maintient un cadrage et une perspective cohérents</li>
  <li>Permet des expositions plus longues si nécessaire</li>
  <li>Libère vos mains pour ajuster le produit ou les réflecteurs</li>
</ul>

<h2>7. Éditez les Photos Professionnellement</h2>

<p>Le post-traitement est essentiel pour créer des images de produits de qualité professionnelle.</p>

<p><strong>Étapes d'édition de base:</strong></p>
<ul>
  <li>Corrigez la balance des blancs pour une représentation précise des couleurs</li>
  <li>Ajustez l'exposition et le contraste</li>
  <li>Supprimez les taches de poussière ou les imperfections</li>
  <li>Recadrez et alignez les images de manière cohérente</li>
  <li>Supprimez les arrière-plans si vous utilisez des PNG transparents</li>
</ul>

<h2>8. Montrez les Produits en Contexte</h2>

<p>Bien que des prises de vue de produits propres et isolées soient essentielles, montrer les produits en utilisation aide les clients à les imaginer dans leur propre vie.</p>

<p><strong>Idées pour des prises contextuelles:</strong></p>
<ul>
  <li>Photos lifestyle montrant le produit en utilisation</li>
  <li>Démonstrations d'échelle avec des objets reconnaissables</li>
  <li>Regroupement de produits connexes</li>
</ul>

<h2>9. Affichez les Variations de Produits</h2>

<p>Si votre produit est disponible en plusieurs couleurs, tailles ou variations, montrez-les toutes.</p>

<p><strong>Meilleures pratiques:</strong></p>
<ul>
  <li>Photographiez chaque variante de couleur individuellement</li>
  <li>Créez une composition cohérente entre les variantes</li>
  <li>Envisagez des prises de groupe montrant toutes les options disponibles ensemble</li>
</ul>

<h2>10. Maintenez la Cohérence de la Marque</h2>

<p>Votre photographie de produits doit refléter l'identité visuelle de votre marque.</p>

<p><strong>Conseils pour la cohérence de la marque:</strong></p>
<ul>
  <li>Développez un guide de style de photographie</li>
  <li>Utilisez un éclairage, des angles et une composition cohérents</li>
  <li>Appliquez la palette de couleurs de votre marque dans les arrière-plans ou accessoires le cas échéant</li>
  <li>Éditez les photos avec un style cohérent</li>
</ul>

<h2>Conclusion</h2>

<p>La photographie professionnelle de produits ne nécessite pas nécessairement un équipement coûteux - juste une attention minutieuse aux détails et une application cohérente de ces principes. En mettant en œuvre ces dix conseils, vous créerez des images de produits qui non seulement paraissent professionnelles mais aident également à augmenter les taux de conversion et à réduire les taux de retour en établissant des attentes précises.</p>

<p>N'oubliez pas qu'une excellente photographie de produits est un investissement qui rapporte des dividendes grâce à l'amélioration des taux de conversion et à la réduction des retours. Que vous le fassiez vous-même ou engagiez un professionnel, prioriser la qualité de l'image est l'un des investissements les plus judicieux que vous puissiez faire dans votre entreprise e-commerce.</p>
                    """,
                    "meta_title": "10 Conseils Essentiels pour la Photographie de Produits E-commerce | iMagenWiz",
                    "meta_description": "Apprenez 10 techniques professionnelles de photographie de produits pour augmenter vos taux de conversion e-commerce et créer des images de produits époustouflantes qui vendent.",
                    "meta_keywords": "photographie de produits, e-commerce, images de produits, optimisation du taux de conversion, photographie de boutique en ligne"
                }
            ]
        }
    ]
    
    # Add blog posts
    for post_data in blog_posts:
        print(f"Creating post: {post_data['slug']}")
        
        # Step 1: Create tags first
        tag_ids = []
        if 'tags' in post_data:
            tags_dict = create_tags(token, post_data['tags'])
            for tag_name, tag_id in tags_dict.items():
                if tag_name in post_data['tags']:
                    tag_ids.append(tag_id)
        
        # Step 2: Create post
        post_payload = {
            "slug": post_data['slug'],
            "featured_image": post_data.get('featured_image'),
            "status": "published",
            "published_at": datetime.utcnow().isoformat(),
            "tags": tag_ids,
            "translations": post_data.get('translations', [])
        }
        
        response = requests.post(
            f"{API_URL}/cms/posts", 
            headers=headers,
            json=post_payload
        )
        
        if response.status_code == 201:
            post_id = response.json().get('id')
            print(f"Successfully created post: {post_data['slug']} (ID: {post_id})")
        else:
            print(f"Failed to create post: {post_data['slug']}")
            print(f"Error: {response.text}")

def main():
    """Main function"""
    try:
        print("Logging in...")
        token = login()
        print(f"Logged in successfully")
        
        print("Ensuring language exists...")
        ensure_language_exists(token, "en", "English")
        ensure_language_exists(token, "fr", "French")
        
        print("Adding sample blog posts...")
        add_sample_blog_posts(token)
        
        print("Done!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()