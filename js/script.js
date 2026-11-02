const AI_BASE_URL = 'https://api.groq.com/openai/v1';
const AI_MODEL = 'openai/gpt-oss-safeguard-20b';
// beware this is not secure
// I'd honestly not want something like that but I'll have to comply with schools requirements
// it's a free service and doesn't give much tokens, good for small things
// Note: I know about it, it'll expired in under 24 hours
const AI_API_KEY = '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';


document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.site-header nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('open');
        });
    }

    const chatLaunch = document.querySelector('.chat-launch');
    const chatClose = document.querySelector('.chat-close');
    const chatPanel = document.querySelector('.chat-panel');
    const chatForm = document.querySelector('.chat-form');
    const chatMessages = document.querySelector('.chat-messages');
    const quickReplies = document.querySelectorAll('[data-chat]');

    if (chatLaunch && chatPanel) {
        chatLaunch.addEventListener('click', () => {
            chatPanel.classList.toggle('open');
        });
    }

    if (chatClose && chatPanel) {
        chatClose.addEventListener('click', () => {
            chatPanel.classList.remove('open');
        });
    }

    function appendMessage(text, type = 'bot') {
        const element = document.createElement('div');
        element.className = type === 'bot' ? 'bot-message' : 'user-message';
        element.innerHTML = text;
        chatMessages.appendChild(element);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendTypingIndicator() {
        const loading = document.createElement('div');
        loading.className = 'chat-loading';
        loading.textContent = 'Maison Lucas répond...';
        loading.id = 'chat-loading';
        chatMessages.appendChild(loading);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const loading = document.getElementById('chat-loading');
        if (loading) loading.remove();
    }

    function fallbackReply(message) {
        const text = message.toLowerCase();

        if (text.includes('produit') || text.includes('pain') || text.includes('viennoiserie') || text.includes('pâtisserie') || text.includes('dessert')) {
            return 'Notre boulangerie propose des pains artisanaux, des croissants, des cookies, des tartes et bien d’autres douceurs. Vous pouvez découvrir tout cela sur la page <strong>Nos Produits</strong>.';
        }

        if (text.includes('horaire') || text.includes('ouvert') || text.includes('open')) {
            return 'Nous sommes ouverts du lundi au samedi de 6h à 20h.';
        }

        if (text.includes('adresse') || text.includes('où') || text.includes('trouver')) {
            return 'Nous sommes situés au 123 Rue du Bon Pain, Cotonou, Bénin.';
        }

        if (text.includes('commande') || text.includes('commander')) {
            return 'Vous pouvez passer commande directement via le formulaire de contact ou en nous appelant au +229 01 23 45 67.';
        }

        if (text.includes('bonjour') || text.includes('salut') || text.includes('merci')) {
            return 'Bonjour ! Nous sommes ravis de vous aider. Que souhaitez-vous savoir sur nos produits, horaires ou commande ?';
        }

        return 'Merci pour votre message. Nous proposons des pains artisanaux, viennoiseries, pâtisseries et un service de commande personnalisé.';
    }

    async function askBot(message) {
        if (!AI_API_KEY) {
            return fallbackReply(message);
        }

        const endpoint = `${AI_BASE_URL.replace(/\/+$/, '')}/chat/completions`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_API_KEY}`,
                    'Accept': 'application/json'
                },
                // exposing more secrets
                body: JSON.stringify({
                    model: AI_MODEL,
                    messages: [
                        {
                            role: 'system',
                            content: `Tu es l’assistant chaleureux et vivant de Maison Lucas, une boulangerie artisanale avec une vraie âme de quartier. Parle en français, de façon naturelle, conviviale et accueillante, comme un membre de l’équipe qui connaît bien les clients. Tu es enthousiaste, rassurant et précis. Tu réponds aux questions sur les produits, les horaires, la commande, l’accueil, les traditions de la boulangerie et la qualité artisanale.

Contexte de la boulangerie:
- Maison Lucas est une boulangerie artisanale fondée il y a plusieurs générations, avec une histoire ancrée dans le savoir-faire du pain, de la viennoiserie et des pâtisseries maison.
- La maison a toujours privilégié les recettes traditionnelles, les ingrédients de qualité et un travail manuel soigné.
- L’équipe valorise le service client, la convivialité et la patience pour proposer une expérience authentique.

Personnes clés de l’entreprise (rôles et historique):
- BIGOT Grâce-Divine : le maître boulanger, responsable de la fabrication du pain et des recettes traditionnelles.
- ADEDEMI Fredhel : le responsable de la pâtisserie et des créations sucrées, viennoiseries et gâteaux.
- GUIDIGAN Merveille : celui qui accueille les clients, veille au service et à la qualité de l’expérience.
- TIDJANI Walid : la personne qui guide l’orientation de la boulangerie et protège son identité artisanale.
- TCHOUGBO Genevièvre : responsable des commandes, de la logistique et des événements. Elle gère les commandes spéciales, les livraisons, les approvisionnements, les relations avec les fournisseurs et la coordination des événements de quartier, ateliers, marchés et commandes d’entreprises. Elle fait le lien entre les clients, la production et l’accueil pour garantir des délais tenus et une expérience fluide.
- BOSSOU Priscillia : responsable qualité, hygiène et transmission du savoir-faire. Elle veille aux normes d’hygiène, à la traçabilité et à la constance des produits, contrôle la qualité des pains, viennoiseries et pâtisseries, et accompagne la formation des nouveaux membres. Elle aide à formaliser les recettes traditionnelles et à préserver les gestes artisanaux.

Ton comportement:
- Tu peux parler avec chaleur, humour léger et admiration pour le travail artisanal.
- Tu mets l’accent sur le fait maison, la qualité, le savoir-faire et le lien avec la communauté.
- Tu restes concis, mais tu peux ajouter une touche de personnalité quand c’est naturel.
- Si un client demande des infos sur un produit, réponds comme un conseiller de boulangerie bien informé et enthousiaste.
- Ne donne jamais de faux détails personnels.`
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 250
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Bot API unavailable: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            const reply = data?.choices?.[0]?.message?.content?.trim();

            if (reply) {
                return reply;
            }

            return fallbackReply(message);
        } catch (error) {
            return fallbackReply(message);
        }
    }

    async function handleUserMessage(text) {
        const cleanText = text.trim();
        if (!cleanText) return;

        appendMessage(cleanText, 'user');
        appendTypingIndicator();

        try {
            const response = await askBot(cleanText);
            removeTypingIndicator();
            appendMessage(response, 'bot');
        } catch (error) {
            removeTypingIndicator();
            appendMessage('Désolé, je n’ai pas pu répondre pour le moment. Réessayez plus tard.', 'bot');
        }
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = chatForm.querySelector('input');
            if (!input) return;
            const value = input.value;
            input.value = '';
            handleUserMessage(value);
        });
    }

    quickReplies.forEach((button) => {
        button.addEventListener('click', () => {
            handleUserMessage(button.dataset.chat || button.textContent.trim());
        });
    });

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const status = contactForm.querySelector('.form-status');
            const nameInput = contactForm.querySelector('input[name="name"]');

            if (status) {
                status.textContent = 'Merci ' + (nameInput ? nameInput.value.split(' ')[0] : 'client') + ' ! Votre message a bien été envoyé.';
            }

            contactForm.reset();
        });
    }
});
