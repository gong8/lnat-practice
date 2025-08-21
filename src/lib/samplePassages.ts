export const AUTHENTIC_LNAT_SAMPLES = [
  {
    topic: "Education & Society",
    text: `Dear Editor,

I am writing to express my profound disagreement with the prevailing orthodoxy that formal education is universally beneficial for children. Having observed the devastating effects of institutionalized learning on my own children and countless others, I have become convinced that we are systematically destroying the natural curiosity and resilience that children are born with.

Consider the absurdity of forcing a seven-year-old to sit motionless for hours, absorbing information that has been pre-digested and sanitized by committees of adults who have never lived a day in the child's world. We lock them away from sunlight, from physical movement, from the rich sensory experiences that their developing brains desperately crave. Instead, we feed them a diet of abstract symbols and artificial problems that bear no resemblance to the challenges they will face in real life.

The modern classroom is nothing more than a factory for producing compliant workers – individuals who have learned to suppress their instincts, ignore their bodily needs, and accept authority without question. We call this "education," but it would be more accurate to call it domestication.

I propose something radical: let children learn as humans have learned for thousands of years, through direct engagement with their environment. Let them climb trees instead of memorizing multiplication tables. Let them build shelters instead of writing essays about other people's adventures. Let them negotiate with their peers instead of raising their hands for permission to speak.

Critics will argue that children need structure, that they require adult guidance to develop properly. But this assumes that adults have somehow transcended the natural learning process – a assumption that becomes increasingly dubious when we observe the epidemic of anxiety, depression, and learned helplessness among school graduates.

The evidence is all around us. Children who spend their days in forests and fields develop superior problem-solving abilities, stronger social bonds, and more robust physical health than their classroom-bound peers. They learn to read the weather, to identify edible plants, to work cooperatively without adult supervision. These are not primitive skills – they are the foundations of genuine intelligence.

Of course, such an approach would require parents to abandon their own educational prejudices and trust in their children's natural capacity for learning. It would mean accepting that a child who can navigate a complex social hierarchy among their peers, who can build a functional fort from found materials, who can track animals through changing terrain, has acquired skills far more valuable than the ability to recite the periodic table or analyze a Shakespearean sonnet.

The tragedy is that we have become so divorced from natural learning that we can no longer recognize genuine competence when we see it.`
  },
  
  {
    topic: "Politics & Governance", 
    text: `The Fundamental Flaw in Democratic Thinking
By Dr. Margaret Thornfield

Democracy, we are told, is the least worst system of government ever devised. This comfortable platitude has become so deeply embedded in Western consciousness that we rarely pause to examine whether it might be fundamentally mistaken. After thirty years of studying political systems across cultures and throughout history, I have become convinced that democracy's central premise – that the will of the majority should determine policy – is not merely flawed but actively destructive to human flourishing.

The problem begins with our romantic notion of "the people." Democratic theory assumes that ordinary citizens, when aggregated, possess some collective wisdom that emerges from their individual limitations. This is rather like assuming that a committee of people who cannot perform surgery will somehow, through discussion and voting, develop the ability to remove an appendix successfully.

Consider the complexity of modern governance. Economic policy requires understanding of intricate relationships between monetary supply, inflation, employment, and international trade. Environmental policy demands expertise in climatology, ecology, industrial chemistry, and systems analysis. Foreign policy necessitates deep knowledge of history, cultural anthropology, military strategy, and international law. Yet we ask citizens who may struggle to balance their household budgets to make informed decisions about national economic policy.

The predictable result is that political discourse becomes dominated not by evidence or expertise, but by emotional appeals and simplified narratives. Politicians succeed not by developing optimal policies, but by crafting messages that resonate with voters' existing prejudices and fears. The most complex challenges facing society – climate change, technological unemployment, genetic engineering, artificial intelligence – become reduced to soundbites and slogans.

Democratic systems also suffer from a fatal temporal bias. Voters naturally prioritize immediate concerns over long-term consequences, since they experience the former directly while the latter remain abstract. Politicians, dependent on regular re-election, have powerful incentives to promise short-term benefits regardless of long-term costs. The result is systematic under-investment in infrastructure, education, research, and environmental protection – precisely the areas where current sacrifice is necessary for future prosperity.

History offers numerous examples of societies that achieved remarkable progress under non-democratic governance. Singapore's transformation from developing to developed nation occurred under Lee Kuan Yew's authoritarian leadership. China's unprecedented economic growth has coincided with centralized political control. Ancient Athens, often cited as the birthplace of democracy, achieved its greatest cultural and intellectual flowering under the guidance of aristocratic elites, not democratic assemblies.

None of this suggests that authoritarian rule is inherently superior – many dictatorships have been disasters. Rather, it suggests that the quality of governance depends more on the competence and integrity of leaders than on the method by which they are selected. A system that prioritizes expertise over popularity, long-term thinking over short-term appeal, and evidence over emotion might serve humanity far better than our current democratic arrangements.

The path forward may require abandoning our sentimental attachment to majority rule in favor of what we might call "epistocracy" – governance by those who demonstrably understand the subjects they are charged with overseeing.`
  },

  {
    topic: "Arts & Culture",
    text: `A Manifesto for the Complete Politicization of Art

Fellow artists, the time for neutrality is over. For too long, we have allowed ourselves to be seduced by the bourgeois myth of "art for art's sake" – the comfortable delusion that creativity can exist in some pristine sphere, untouched by the brutal realities of power, oppression, and social struggle. This aesthetic monasticism has not protected art from political influence; it has simply ensured that art serves the dominant political order by default.

Every brushstroke that does not challenge injustice reinforces it. Every novel that ignores systemic oppression normalizes it. Every song that fails to name our enemies serves their interests. The very notion of "apolitical" art is itself a political position – one that privileges the status quo and the comfort of those who benefit from it.

Consider the resources devoted to art in our society: public funding, private patronage, institutional support, critical attention, cultural prestige. Where do these resources come from, and what do they serve? They flow from the same systems that perpetuate inequality, environmental destruction, and human suffering. When we accept these resources without demanding transformation in return, we become complicit in the very structures our art should be dismantling.

The history of art is inseparable from the history of power. Renaissance painters served aristocratic patrons and religious hierarchies. Romantic poets celebrated national mythologies that justified imperial expansion. Abstract expressionists were subsidized by the CIA to promote American cultural superiority during the Cold War. The idea that art can transcend politics is a luxury belief, available only to those whose lives are not immediately threatened by political circumstances.

True artistic revolution requires abandoning the comfortable fiction that beauty and politics occupy separate realms. Instead, we must recognize that the most profound aesthetic experiences emerge from the collision between artistic vision and social reality. The greatest works in human history – from Guernica to Invisible Man to The Battle of Algiers – achieved their power precisely because they refused to retreat into aesthetic purity.

This does not mean reducing art to propaganda or sacrificing complexity for message. On the contrary, politicized art demands greater sophistication, not less. The artist who seeks to change the world must master not only technical craft but also historical analysis, economic understanding, and strategic thinking. Political art requires grappling with contradictions, acknowledging complicity, and finding ways to embody resistance without falling into didactic simplification.

The objection will be raised that such an approach instrumentalizes art, reducing it to a mere tool for political ends. But this objection misunderstands the relationship between means and ends in revolutionary practice. When artists commit to social transformation, they do not subordinate their artistic vision to external political goals; rather, they discover that their deepest aesthetic impulses are inherently political. The desire to create beauty becomes inseparable from the desire to create justice.

We can no longer afford the luxury of aesthetic contemplation while the world burns. Every moment spent on "pure" artistic expression is a moment stolen from the urgent work of social transformation. The question is not whether art should be political, but whether it will serve the politics of domination or the politics of liberation.`
  }
];

export function getRandomSample(): string {
  const sample = AUTHENTIC_LNAT_SAMPLES[Math.floor(Math.random() * AUTHENTIC_LNAT_SAMPLES.length)];
  return sample.text;
}

export function getSamplesByTopic(topic: string): string[] {
  return AUTHENTIC_LNAT_SAMPLES
    .filter(sample => sample.topic.toLowerCase().includes(topic.toLowerCase()) || topic === 'All Topics')
    .map(sample => sample.text);
}