import { getCount } from '../helpers.js';

// Predefined paragraphs categorized by context
const categorizedParagraphs = {
    general: [
        "Collaboration is key to successful project delivery. Utilizing shared workspaces and clear communication channels ensures that all team members are aligned and working towards common goals.",
        "User feedback provides invaluable insights for product improvement. Actively soliciting and analyzing user comments helps prioritize features and fix issues, leading to a more refined and user-centric product.",
        "Effective time management allows individuals and teams to prioritize tasks and achieve objectives efficiently. Breaking down large goals into smaller, manageable steps can improve focus and productivity.",
        "Continuous learning is essential in today's rapidly changing environment. Staying updated with new skills and knowledge helps maintain relevance and fosters personal and professional growth."
    ],
    technology: [
        "Explore the possibilities of modern web development with intuitive user interfaces and seamless backend integrations. Our platform provides the tools you need to build responsive and engaging applications efficiently.",
        "Scalable cloud architecture allows applications to handle growth gracefully. Designing systems that can adapt to increasing loads ensures reliability and maintains performance as user bases expand.",
        "API design principles emphasize consistency, clarity, and predictability. Well-designed APIs are easier for developers to understand, integrate, and maintain, fostering a positive developer experience.",
        "DevOps practices streamline the software development lifecycle by automating build, test, and deployment processes. This leads to faster release cycles and improved collaboration between development and operations teams."
    ],
    business: [
        "Understanding market trends is crucial for strategic decision-making. Analyzing competitor actions and consumer behavior helps businesses identify opportunities and navigate potential challenges effectively.",
        "Financial planning provides a roadmap for achieving business objectives. Budgeting, forecasting, and managing cash flow are essential components of sustainable financial health.",
        "Building strong customer relationships drives loyalty and long-term value. Providing excellent service and personalized experiences can differentiate a business in a competitive marketplace.",
        "Effective marketing strategies connect businesses with their target audience. Utilizing a mix of digital channels and traditional methods helps build brand awareness and generate qualified leads."
    ],
    design: [
        "Data visualization helps in understanding complex datasets by presenting information in a graphical format. Effective charts and graphs can reveal patterns, trends, and outliers that might otherwise go unnoticed.",
        "Accessibility should be a primary consideration in design and development. Creating products that are usable by everyone, regardless of ability, expands reach and improves the overall user experience.",
        "User interface (UI) design focuses on the visual presentation and interactivity of a product. Consistent layouts, clear typography, and intuitive navigation contribute to a positive user perception.",
        "User experience (UX) design encompasses all aspects of the end-user's interaction with the company, its services, and products. It aims to create seamless, enjoyable, and efficient interactions."
    ]
};

const availableContexts = Object.keys(categorizedParagraphs);

/**
 * Handler for generating readable text paragraphs based on context.
 */
export const handleReadableText = (c) => {
    const context = c.req.query('context')?.toLowerCase() || 'general';
    const paragraphArray = categorizedParagraphs[context] || categorizedParagraphs.general;

    const count = getCount(c, paragraphArray.length); // Max count based on selected context
    console.log(`Handling /readable_text with context: ${context}, count: ${count}`);

    // Randomly select 'count' paragraphs from the chosen context array
    const selectedParagraphs = Array.from({ length: count }, () =>
        paragraphArray[Math.floor(Math.random() * paragraphArray.length)]
    );

    // Always return an object or array of objects with a 'text' key
    if (count === 1) {
        return c.json({ text: selectedParagraphs[0] });
    } else {
        const result = selectedParagraphs.map(p => ({ text: p }));
        return c.json(result);
        // Note: We are not nesting under 'paragraphs' anymore for consistency
    }
}; 