// ATS Resume Analyzer - Free tool for analyzing resume ATS compatibility

export interface ATSAnalysisResult {
  overallScore: number
  sections: {
    formatting: {
      score: number
      issues: string[]
      recommendations: string[]
    }
    content: {
      score: number
      issues: string[]
      recommendations: string[]
    }
    keywords: {
      score: number
      issues: string[]
      recommendations: string[]
      suggestedKeywords: string[]
    }
    structure: {
      score: number
      issues: string[]
      recommendations: string[]
    }
  }
  summary: {
    strengths: string[]
    criticalIssues: string[]
    quickWins: string[]
  }
}

// Common ATS-friendly keywords by industry
const industryKeywords = {
  technology: [
    'software development', 'programming', 'coding', 'debugging', 'testing',
    'agile', 'scrum', 'git', 'api', 'database', 'cloud computing', 'devops',
    'machine learning', 'artificial intelligence', 'data analysis', 'cybersecurity'
  ],
  business: [
    'project management', 'strategic planning', 'business analysis', 'leadership',
    'team management', 'budget management', 'stakeholder management', 'process improvement',
    'market research', 'sales', 'customer service', 'negotiation', 'communication'
  ],
  marketing: [
    'digital marketing', 'content marketing', 'social media', 'seo', 'sem',
    'email marketing', 'brand management', 'campaign management', 'analytics',
    'conversion optimization', 'lead generation', 'market segmentation'
  ],
  finance: [
    'financial analysis', 'budgeting', 'forecasting', 'risk management',
    'compliance', 'audit', 'accounting', 'financial modeling', 'investment',
    'portfolio management', 'regulatory', 'financial reporting'
  ],
  healthcare: [
    'patient care', 'clinical experience', 'medical records', 'healthcare compliance',
    'medical terminology', 'patient safety', 'quality improvement', 'healthcare technology',
    'electronic health records', 'medical research', 'clinical trials'
  ]
}

// ATS-problematic formatting patterns
const problematicPatterns = [
  { pattern: /\t/g, issue: 'Contains tab characters', severity: 'medium' },
  { pattern: /[^\x00-\x7F]/g, issue: 'Contains special characters', severity: 'low' },
  { pattern: /\|/g, issue: 'Contains pipe characters', severity: 'medium' },
  { pattern: /\u2022/g, issue: 'Contains bullet point symbols', severity: 'low' },
  { pattern: /\u2013|\u2014/g, issue: 'Contains em/en dashes', severity: 'low' },
  { pattern: /\u201C|\u201D/g, issue: 'Contains smart quotes', severity: 'low' }
]

// Required resume sections
const requiredSections = [
  'contact information',
  'professional summary',
  'work experience',
  'education',
  'skills'
]

export function analyzeResumeATS(resumeText: string, targetIndustry?: string): ATSAnalysisResult {
  const text = resumeText.toLowerCase()
  
  // Analyze formatting
  const formattingAnalysis = analyzeFormatting(resumeText)
  
  // Analyze content structure
  const structureAnalysis = analyzeStructure(text)
  
  // Analyze content quality
  const contentAnalysis = analyzeContent(text)
  
  // Analyze keywords
  const keywordAnalysis = analyzeKeywords(text, targetIndustry)
  
  // Calculate overall score
  const overallScore = Math.round(
    (formattingAnalysis.score * 0.25) +
    (structureAnalysis.score * 0.25) +
    (contentAnalysis.score * 0.25) +
    (keywordAnalysis.score * 0.25)
  )
  
  // Generate summary
  const summary = generateSummary({
    formatting: formattingAnalysis,
    structure: structureAnalysis,
    content: contentAnalysis,
    keywords: keywordAnalysis
  }, overallScore)
  
  return {
    overallScore,
    sections: {
      formatting: formattingAnalysis,
      content: contentAnalysis,
      keywords: keywordAnalysis,
      structure: structureAnalysis
    },
    summary
  }
}

function analyzeFormatting(text: string) {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100
  
  // Check for problematic patterns
  problematicPatterns.forEach(({ pattern, issue, severity }) => {
    const matches = text.match(pattern)
    if (matches) {
      issues.push(`${issue} (${matches.length} instances)`)
      score -= severity === 'high' ? 20 : severity === 'medium' ? 10 : 5
    }
  })
  
  // Check text length
  if (text.length < 500) {
    issues.push('Resume appears too short (less than 500 characters)')
    recommendations.push('Add more detail to your work experience and achievements')
    score -= 15
  }
  
  if (text.length > 4000) {
    issues.push('Resume appears too long (over 4000 characters)')
    recommendations.push('Consider condensing content to 1-2 pages')
    score -= 10
  }
  
  // Check for common formatting issues
  if (text.includes('●') || text.includes('•')) {
    recommendations.push('Replace bullet symbols with simple dashes (-) for better ATS compatibility')
  }
  
  if (!issues.length) {
    recommendations.push('Great formatting! Your resume appears ATS-friendly')
  }
  
  return {
    score: Math.max(0, score),
    issues,
    recommendations
  }
}

function analyzeStructure(text: string) {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100
  
  // Check for required sections
  const missingSections: string[] = []
  
  requiredSections.forEach(section => {
    const sectionPatterns = {
      'contact information': /(?:email|phone|address|linkedin)/,
      'professional summary': /(?:summary|profile|objective|about)/,
      'work experience': /(?:experience|employment|work history|career)/,
      'education': /(?:education|degree|university|college|school)/,
      'skills': /(?:skills|competencies|technologies|tools)/
    }
    
    if (!sectionPatterns[section as keyof typeof sectionPatterns]?.test(text)) {
      missingSections.push(section)
    }
  })
  
  if (missingSections.length > 0) {
    issues.push(`Missing sections: ${missingSections.join(', ')}`)
    recommendations.push(`Add the following sections: ${missingSections.join(', ')}`)
    score -= missingSections.length * 15
  }
  
  // Check for dates in work experience
  const datePattern = /\b(19|20)\d{2}\b/g
  const dates = text.match(datePattern)
  if (!dates || dates.length < 2) {
    issues.push('Missing or insufficient date information')
    recommendations.push('Include start and end dates for work experience and education')
    score -= 10
  }
  
  // Check for quantifiable achievements
  const numberPattern = /\b\d+(?:\.\d+)?(?:%|k|million|billion|thousand)?\b/g
  const numbers = text.match(numberPattern)
  if (!numbers || numbers.length < 3) {
    issues.push('Limited quantifiable achievements')
    recommendations.push('Add specific numbers, percentages, or metrics to demonstrate impact')
    score -= 15
  }
  
  return {
    score: Math.max(0, score),
    issues,
    recommendations
  }
}

function analyzeContent(text: string) {
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100
  
  // Check for action verbs
  const actionVerbs = [
    'achieved', 'managed', 'led', 'developed', 'created', 'implemented',
    'improved', 'increased', 'reduced', 'optimized', 'designed', 'built',
    'launched', 'delivered', 'coordinated', 'supervised', 'analyzed'
  ]
  
  const foundVerbs = actionVerbs.filter(verb => text.includes(verb))
  if (foundVerbs.length < 5) {
    issues.push('Limited use of strong action verbs')
    recommendations.push('Use more action verbs like: achieved, managed, led, developed, implemented')
    score -= 10
  }
  
  // Check for passive language
  const passivePatterns = [
    /was responsible for/g,
    /duties included/g,
    /responsible for/g,
    /tasked with/g
  ]
  
  let passiveCount = 0
  passivePatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) passiveCount += matches.length
  })
  
  if (passiveCount > 2) {
    issues.push('Overuse of passive language')
    recommendations.push('Replace passive phrases with active accomplishments')
    score -= 15
  }
  
  // Check for personal pronouns
  const pronounPattern = /\b(i|me|my|myself)\b/g
  const pronouns = text.match(pronounPattern)
  if (pronouns && pronouns.length > 3) {
    issues.push('Overuse of personal pronouns')
    recommendations.push('Remove personal pronouns (I, me, my) for a more professional tone')
    score -= 10
  }
  
  return {
    score: Math.max(0, score),
    issues,
    recommendations
  }
}

function analyzeKeywords(text: string, targetIndustry?: string) {
  const issues: string[] = []
  const recommendations: string[] = []
  const suggestedKeywords: string[] = []
  let score = 100
  
  // Get relevant keywords for industry
  const relevantKeywords = targetIndustry && industryKeywords[targetIndustry as keyof typeof industryKeywords] 
    ? industryKeywords[targetIndustry as keyof typeof industryKeywords]
    : []
  
  if (relevantKeywords.length > 0) {
    const foundKeywords = relevantKeywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    )
    
    const keywordDensity = foundKeywords.length / relevantKeywords.length
    
    if (keywordDensity < 0.2) {
      issues.push(`Low industry keyword density (${Math.round(keywordDensity * 100)}%)`)
      recommendations.push('Include more industry-specific keywords and skills')
      score -= 20
    }
    
    // Suggest missing keywords
    const missingKeywords = relevantKeywords.filter(keyword => 
      !text.includes(keyword.toLowerCase())
    ).slice(0, 8)
    
    suggestedKeywords.push(...missingKeywords)
  }
  
  // Check for technical skills section
  const techSkillsPattern = /(?:technical skills|technologies|programming languages|software|tools)/
  if (!techSkillsPattern.test(text) && targetIndustry === 'technology') {
    issues.push('Missing technical skills section')
    recommendations.push('Add a dedicated technical skills section')
    score -= 15
  }
  
  // Check for soft skills
  const softSkills = ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical']
  const foundSoftSkills = softSkills.filter(skill => text.includes(skill))
  
  if (foundSoftSkills.length < 2) {
    issues.push('Limited soft skills mentioned')
    recommendations.push('Include relevant soft skills like leadership, communication, teamwork')
    score -= 10
  }
  
  return {
    score: Math.max(0, score),
    issues,
    recommendations,
    suggestedKeywords
  }
}

function generateSummary(sections: any, overallScore: number) {
  const strengths: string[] = []
  const criticalIssues: string[] = []
  const quickWins: string[] = []
  
  // Identify strengths
  if (sections.formatting.score >= 80) {
    strengths.push('Good ATS-friendly formatting')
  }
  if (sections.structure.score >= 80) {
    strengths.push('Well-structured resume with required sections')
  }
  if (sections.content.score >= 80) {
    strengths.push('Strong use of action verbs and professional language')
  }
  if (sections.keywords.score >= 80) {
    strengths.push('Good keyword optimization for your industry')
  }
  
  // Identify critical issues
  if (sections.formatting.score < 60) {
    criticalIssues.push('Formatting issues may prevent ATS parsing')
  }
  if (sections.structure.score < 60) {
    criticalIssues.push('Missing essential resume sections')
  }
  if (sections.content.score < 60) {
    criticalIssues.push('Content needs improvement for better impact')
  }
  if (sections.keywords.score < 60) {
    criticalIssues.push('Insufficient industry-relevant keywords')
  }
  
  // Identify quick wins
  if (sections.keywords.suggestedKeywords.length > 0) {
    quickWins.push('Add suggested industry keywords to improve relevance')
  }
  if (sections.content.issues.includes('Limited quantifiable achievements')) {
    quickWins.push('Add specific numbers and metrics to achievements')
  }
  if (sections.formatting.issues.some(issue => issue.includes('bullet symbols'))) {
    quickWins.push('Replace special bullet symbols with simple dashes')
  }
  
  return {
    strengths,
    criticalIssues,
    quickWins
  }
}
