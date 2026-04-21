const templates = {
  fundamentals: [
    {
      skill: "dbms",
      type: "text",
      difficulty: "easy",
      question: "In a system like {project}, why does normalization matter for data quality and long-term maintainability?"
    },
    {
      skill: "os",
      type: "text",
      difficulty: "easy",
      question: "In a product like {project}, why would you choose multiple threads inside one process instead of spinning up separate processes for every task?"
    },
    {
      skill: "network",
      type: "text",
      difficulty: "medium",
      question: "When a user opens {project} in the browser, what happens from URL entry to page render, and why does each step matter for performance and reliability?"
    },
    {
      skill: "dbms",
      type: "text",
      difficulty: "medium",
      question: "In a system like {project}, how do ACID properties protect data consistency, and why do they matter during failures or concurrent updates?"
    }
  ],

  frontend: [
    {
      skill: "react",
      type: "text",
      difficulty: "easy",
      question: "What is Virtual DOM and how does React use it?"
    },
    {
      skill: "react",
      type: "text",
      difficulty: "medium",
      question: "Explain useEffect hook and its lifecycle behavior."
    },
    {
      skill: "js",
      type: "text",
      difficulty: "medium",
      question: "What are closures in JavaScript? Give a practical example."
    }
  ],

  backend: [
    {
      skill: "node",
      type: "text",
      difficulty: "medium",
      question: "Explain how the event loop works in Node.js."
    },
    {
      skill: "express",
      type: "text",
      difficulty: "easy",
      question: "What is middleware in Express and how is it used?"
    },
    {
      skill: "api",
      type: "text",
      difficulty: "medium",
      question: "How do you implement authentication and authorization in APIs?"
    }
  ],

  project: [
    {
      type: "text",
      difficulty: "medium",
      question: "In {project}, walk me through the architecture, the data flow, and why you structured it that way for real users."
    },
    {
      type: "text",
      difficulty: "medium",
      question: "For {project}, why did you choose {skills}, what alternatives did you evaluate, and why was this the right tradeoff?"
    },
    {
      type: "text",
      difficulty: "hard",
      question: "In {project}, what was the toughest real production or implementation challenge, how did you solve it, and why did that solution work?"
    },
    {
      type: "text",
      difficulty: "hard",
      question: "If {project} needed to support a bigger user base tomorrow, what would you redesign first, and why would that change matter most?"
    }
  ],

  scenario: [
    {
      type: "text",
      difficulty: "medium",
      question: "A production issue appears in a system built with {skills}. How would you debug it step-by-step, and why would you prioritize those checks first?"
    },
    {
      type: "text",
      difficulty: "hard",
      question: "{project} is failing under heavy traffic. How would you stabilize it first, how would you scale it next, and why in that order?"
    },
    {
      type: "text",
      difficulty: "hard",
      question: "A risky release broke production. How would you handle rollback, stakeholder communication, and follow-up prevention, and why?"
    },
    {
      type: "text",
      difficulty: "medium",
      question: "If {project} had to handle 10x traffic growth, what would you change in the design first, and why would those changes matter most?"
    }
  ],

  behavioral: [
    {
      type: "text",
      difficulty: "easy",
      question: "Tell me about a challenge you faced while working with {skills}."
    },
    {
      type: "text",
      difficulty: "medium",
      question: "Why should we hire you for a role that uses {skills}?"
    },
    {
      type: "text",
      difficulty: "easy",
      question: "How do you handle pressure during deadlines?"
    },
    {
      type: "text",
      difficulty: "medium",
      question: "Tell me about a time you failed and what you learned."
    }
  ]
};

module.exports = { templates };
