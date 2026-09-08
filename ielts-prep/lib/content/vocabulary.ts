import type { VocabularyWord } from '@/types/models';

function w(
  word: string,
  definition: string,
  exampleSentence: string,
  topic: string,
  synonyms: string[],
  collocations: string[],
  pronunciationIpa: string,
  difficulty: VocabularyWord['difficulty']
): VocabularyWord {
  return {
    id: `v-${word.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    word,
    definition,
    exampleSentence,
    topic,
    synonyms,
    collocations,
    pronunciationIpa,
    difficulty,
  };
}

export const vocabularyWords: VocabularyWord[] = [
  // Education
  w('curriculum', 'The subjects and content taught in a course of study.', 'The university recently updated its curriculum to include more practical coursework.', 'Education', ['syllabus', 'course of study'], ['core curriculum', 'curriculum design'], '/kəˈrɪkjʊləm/', 'medium'),
  w('rote learning', 'Memorising information through repetition rather than understanding.', 'Critics argue that rote learning discourages critical thinking in students.', 'Education', ['memorisation'], ['rely on rote learning'], '/rəʊt ˈlɜːnɪŋ/', 'hard'),
  w('literacy', 'The ability to read and write.', 'Improving adult literacy remains a priority in many developing regions.', 'Education', ['reading ability'], ['literacy rate', 'digital literacy'], '/ˈlɪtərəsi/', 'easy'),
  w('tuition fees', 'Money paid for instruction, especially at a college or university.', 'Rising tuition fees have made university less accessible for low-income students.', 'Education', ['tuition costs'], ['pay tuition fees', 'tuition fee increase'], '/tjuˈɪʃn fiːz/', 'medium'),
  w('vocational training', 'Education that prepares people for a specific trade or occupation.', 'Vocational training can offer a faster route into skilled employment than a university degree.', 'Education', ['technical training'], ['vocational training programme'], '/vəʊˈkeɪʃənl ˈtreɪnɪŋ/', 'hard'),

  // Technology
  w('artificial intelligence', 'Computer systems able to perform tasks normally requiring human intelligence.', 'Artificial intelligence is increasingly used to diagnose medical conditions.', 'Technology', ['AI'], ['AI-powered', 'artificial intelligence system'], '/ˌɑːtɪˈfɪʃl ɪnˈtɛlɪdʒəns/', 'medium'),
  w('automation', 'The use of machines or computers to do work previously done by people.', 'Automation has reduced the number of manual jobs in manufacturing.', 'Technology', ['mechanisation'], ['automate a process', 'automation technology'], '/ˌɔːtəˈmeɪʃn/', 'medium'),
  w('cybersecurity', 'Protection of computer systems from theft or damage.', 'Companies are investing heavily in cybersecurity following recent data breaches.', 'Technology', ['data security'], ['cybersecurity threat', 'cybersecurity measures'], '/ˌsaɪbəsɪˈkjʊərəti/', 'hard'),
  w('obsolete', 'No longer used or needed; out of date.', 'Many physical skills have become obsolete due to advances in technology.', 'Technology', ['outdated', 'redundant'], ['render obsolete', 'obsolete technology'], '/ˈɒbsəliːt/', 'medium'),
  w('breakthrough', 'A sudden, important discovery or development.', 'The breakthrough in battery technology could transform the electric vehicle industry.', 'Technology', ['major advance'], ['scientific breakthrough', 'technological breakthrough'], '/ˈbreɪkθruː/', 'medium'),

  // Environment
  w('carbon footprint', 'The amount of carbon dioxide released by an individual or organisation.', 'Flying less is one of the most effective ways to reduce your carbon footprint.', 'Environment', ['carbon emissions'], ['reduce your carbon footprint', 'large carbon footprint'], '/ˈkɑːbən ˈfʊtprɪnt/', 'medium'),
  w('biodiversity', 'The variety of plant and animal life in a particular habitat.', 'Deforestation poses a serious threat to global biodiversity.', 'Environment', ['ecological diversity'], ['loss of biodiversity', 'biodiversity hotspot'], '/ˌbaɪəʊdaɪˈvɜːsəti/', 'hard'),
  w('renewable energy', 'Energy from sources that are naturally replenished, such as sun or wind.', 'Investment in renewable energy has grown rapidly over the past decade.', 'Environment', ['clean energy', 'green energy'], ['renewable energy source', 'switch to renewable energy'], '/rɪˈnjuːəbl ˈɛnədʒi/', 'medium'),
  w('deforestation', 'The clearing of forests on a large scale.', 'Deforestation in the region has accelerated due to demand for agricultural land.', 'Environment', ['forest clearance'], ['halt deforestation', 'rate of deforestation'], '/diːˌfɒrɪˈsteɪʃn/', 'hard'),
  w('sustainable', 'Able to continue over time without depleting resources.', 'The company is under pressure to adopt more sustainable manufacturing practices.', 'Environment', ['eco-friendly', 'viable long-term'], ['sustainable development', 'environmentally sustainable'], '/səˈsteɪnəbl/', 'medium'),

  // Health
  w('sedentary lifestyle', 'A lifestyle involving little or no physical activity.', 'A sedentary lifestyle is linked to a higher risk of heart disease.', 'Health', ['inactive lifestyle'], ['lead to a sedentary lifestyle'], '/ˈsɛdntəri ˈlaɪfstaɪl/', 'hard'),
  w('preventive care', 'Medical care intended to prevent illness rather than treat it.', 'Governments are investing more in preventive care to reduce long-term healthcare costs.', 'Health', ['preventative medicine'], ['preventive care programme'], '/prɪˈvɛntɪv keə/', 'medium'),
  w('malnutrition', 'A lack of proper nutrition, caused by not having enough to eat.', 'Malnutrition remains a serious problem in several low-income countries.', 'Health', ['undernourishment'], ['suffer from malnutrition', 'tackle malnutrition'], '/ˌmælnjuːˈtrɪʃn/', 'hard'),
  w('life expectancy', 'The average period a person may expect to live.', 'Life expectancy has risen significantly worldwide over the past century.', 'Health', ['lifespan'], ['average life expectancy', 'increase in life expectancy'], '/laɪf ɪkˈspɛktənsi/', 'medium'),
  w('epidemic', 'A widespread occurrence of a disease within a population.', 'Public health officials acted quickly to contain the epidemic.', 'Health', ['outbreak'], ['epidemic of obesity', 'contain an epidemic'], '/ˌɛpɪˈdɛmɪk/', 'medium'),

  // Work
  w('work-life balance', 'A satisfactory balance between work and personal life.', 'Remote work has helped many employees achieve a better work-life balance.', 'Work', ['work-life equilibrium'], ['maintain a work-life balance', 'poor work-life balance'], '/wɜːk laɪf ˈbæləns/', 'medium'),
  w('redundancy', 'Loss of a job because it is no longer needed.', 'Automation has led to widespread redundancy in the manufacturing sector.', 'Work', ['job loss', 'layoff'], ['face redundancy', 'redundancy payment'], '/rɪˈdʌndənsi/', 'hard'),
  w('flexitime', 'A system allowing employees to choose their own working hours within limits.', 'Flexitime arrangements have become increasingly common since the pandemic.', 'Work', ['flexible hours'], ['work flexitime', 'introduce flexitime'], '/ˈflɛksɪtaɪm/', 'medium'),
  w('entrepreneur', 'A person who sets up and runs a business, taking on financial risk.', 'Many young entrepreneurs are launching start-ups straight out of university.', 'Work', ['business owner', 'founder'], ['aspiring entrepreneur', 'successful entrepreneur'], '/ˌɒntrəprəˈnɜː/', 'medium'),
  w('workforce', 'The people who work in a particular industry or country.', 'Ageing populations are shrinking the workforce in several developed nations.', 'Work', ['labour force'], ['skilled workforce', 'shrinking workforce'], '/ˈwɜːkfɔːs/', 'easy'),

  // Society
  w('social cohesion', 'The bonds that bring people in a society together.', 'Community events can play an important role in strengthening social cohesion.', 'Society', ['community unity'], ['promote social cohesion', 'erode social cohesion'], '/ˈsəʊʃl kəʊˈhiːʒn/', 'hard'),
  w('income inequality', 'An unequal distribution of income across a population.', 'Income inequality has widened in many economies over the past thirty years.', 'Society', ['wealth gap'], ['reduce income inequality', 'rising income inequality'], '/ˈɪnkʌm ˌɪnɪˈkwɒləti/', 'medium'),
  w('urbanisation', 'The process by which more people come to live in cities.', 'Rapid urbanisation has placed significant strain on public infrastructure.', 'Society', ['city growth'], ['rapid urbanisation', 'urbanisation trend'], '/ˌɜːbənaɪˈzeɪʃn/', 'medium'),
  w('social mobility', 'The ability of individuals to move between social classes.', 'Access to quality education is strongly linked to social mobility.', 'Society', ['class mobility'], ['upward social mobility', 'limited social mobility'], '/ˈsəʊʃl məʊˈbɪləti/', 'hard'),
  w('demographic', 'Relating to the structure of a population.', "The country's ageing demographic presents challenges for its pension system.", 'Society', ['population-related'], ['demographic shift', 'target demographic'], '/ˌdɛməˈɡræfɪk/', 'medium'),

  // Travel
  w('itinerary', 'A planned route or schedule for a journey.', 'She planned a detailed itinerary before setting off on her backpacking trip.', 'Travel', ['travel plan', 'route plan'], ['detailed itinerary', 'travel itinerary'], '/aɪˈtɪnərəri/', 'medium'),
  w('excursion', 'A short trip taken for pleasure, often part of a longer holiday.', 'The tour included a day excursion to a nearby national park.', 'Travel', ['outing', 'day trip'], ['organised excursion', 'go on an excursion'], '/ɪkˈskɜːʃn/', 'medium'),
  w('congestion', 'Overcrowding, especially of traffic or people in a location.', 'Traffic congestion in the city centre has worsened as tourism has grown.', 'Travel', ['overcrowding'], ['traffic congestion', 'ease congestion'], '/kənˈdʒɛstʃən/', 'medium'),
  w('accommodation', 'A place where someone stays, such as a hotel or hostel.', 'Budget travellers often look for shared accommodation to cut costs.', 'Travel', ['lodging'], ['book accommodation', 'affordable accommodation'], '/əˌkɒməˈdeɪʃn/', 'easy'),

  // Crime
  w('deterrent', 'Something that discourages a particular action, such as crime.', 'Some argue that harsher sentences act as a stronger deterrent to crime.', 'Crime', ['disincentive'], ['act as a deterrent', 'effective deterrent'], '/dɪˈtɛrənt/', 'hard'),
  w('rehabilitation', 'The process of helping someone re-adapt to society after imprisonment.', 'The new programme focuses on rehabilitation rather than punishment alone.', 'Crime', ['reform'], ['rehabilitation programme', 'focus on rehabilitation'], '/ˌriːəˌbɪlɪˈteɪʃn/', 'hard'),
  w('surveillance', 'Close observation of a person or area, especially by police or cameras.', 'The use of surveillance cameras in public spaces remains controversial.', 'Crime', ['monitoring'], ['surveillance camera', 'under surveillance'], '/səˈveɪləns/', 'medium'),
  w('juvenile delinquency', 'Criminal behaviour by young people.', 'Researchers have linked juvenile delinquency to a lack of community support structures.', 'Crime', ['youth crime'], ['prevent juvenile delinquency'], '/ˈdʒuːvənaɪl dɪˈlɪŋkwənsi/', 'hard'),

  // Culture
  w('heritage', 'Traditions, buildings, and objects passed down from previous generations.', 'The old town is recognised as a UNESCO World Heritage site.', 'Culture', ['legacy', 'tradition'], ['cultural heritage', 'preserve heritage'], '/ˈhɛrɪtɪdʒ/', 'medium'),
  w('assimilation', 'The process of adapting to and adopting a new culture.', 'Language classes can support the assimilation of new immigrants into local communities.', 'Culture', ['integration'], ['cultural assimilation', 'gradual assimilation'], '/əˌsɪmɪˈleɪʃn/', 'hard'),
  w('multiculturalism', 'The presence of several distinct cultural groups within one society.', 'Multiculturalism has shaped the cuisine, music, and language of many major cities.', 'Culture', ['cultural diversity'], ['embrace multiculturalism'], '/ˌmʌltiˈkʌltʃərəlɪzəm/', 'hard'),

  // Media
  w('censorship', 'The suppression of information considered objectionable by authorities.', 'Critics argue that increased censorship online threatens freedom of expression.', 'Media', ['suppression of information'], ['government censorship', 'impose censorship'], '/ˈsɛnsəʃɪp/', 'hard'),
  w('misinformation', 'False or inaccurate information spread regardless of intent to deceive.', 'Social media platforms are under pressure to limit the spread of misinformation.', 'Media', ['false information'], ['spread of misinformation', 'combat misinformation'], '/ˌmɪsɪnfəˈmeɪʃn/', 'medium'),
  w('tabloid', 'A newspaper with a small page size, often focused on sensational stories.', 'Tabloid journalism often prioritises entertainment value over factual accuracy.', 'Media', ['popular press'], ['tabloid newspaper', 'tabloid headline'], '/ˈtæblɔɪd/', 'medium'),

  // Globalization
  w('globalisation', 'The process by which businesses and cultures become interconnected worldwide.', 'Globalisation has made it easier for small businesses to reach international customers.', 'Globalization', ['global integration'], ['effects of globalisation', 'rapid globalisation'], '/ˌɡləʊbəlaɪˈzeɪʃn/', 'medium'),
  w('outsourcing', 'Contracting work out to an external, often overseas, provider.', 'Many companies reduce costs through outsourcing manufacturing to other countries.', 'Globalization', ['offshoring'], ['outsourcing jobs', 'outsourcing to overseas'], '/ˈaʊtsɔːsɪŋ/', 'medium'),
  w('interdependence', 'Mutual reliance between two or more groups or countries.', 'Global supply chains have created deep economic interdependence between nations.', 'Globalization', ['mutual reliance'], ['economic interdependence'], '/ˌɪntədɪˈpɛndəns/', 'hard'),

  // Education (additional)
  w('academic integrity', 'Honesty and fairness in scholarly work, especially avoiding plagiarism.', 'Universities run workshops to help new students understand academic integrity before their first assignment.', 'Education', ['scholarly honesty'], ['breach of academic integrity', 'uphold academic integrity'], '/ˌækəˈdɛmɪk ɪnˈtɛɡrəti/', 'hard'),
  w('extracurricular', 'Relating to activities outside the normal school or university curriculum.', 'Employers often value extracurricular activities as evidence of teamwork and initiative.', 'Education', ['non-academic'], ['extracurricular activities', 'extracurricular clubs'], '/ˌɛkstrəkəˈrɪkjʊlə/', 'medium'),
  w('scholarship', "A grant or payment made to support a student's education.", 'She was awarded a scholarship that covered her entire tuition fees.', 'Education', ['grant', 'bursary'], ['win a scholarship', 'scholarship recipient'], '/ˈskɒləʃɪp/', 'easy'),
  w('plagiarism', "The practice of using someone else's work or ideas without acknowledgement.", 'The essay was rejected after software detected clear plagiarism from an online source.', 'Education', ['copying', 'intellectual theft'], ['accused of plagiarism', 'detect plagiarism'], '/ˈpleɪdʒərɪzəm/', 'medium'),
  w('numeracy', 'The ability to understand and work with numbers.', 'Basic numeracy skills are essential for managing personal finances.', 'Education', ['mathematical ability'], ['numeracy skills', 'numeracy test'], '/ˈnjuːmərəsi/', 'easy'),
  w('mentor', 'An experienced person who advises and guides someone less experienced.', 'A good mentor can help a new graduate navigate the early stages of their career.', 'Education', ['adviser', 'coach'], ['find a mentor', 'mentor relationship'], '/ˈmɛntɔː/', 'easy'),
  w('cognitive development', "The growth of a person's ability to think, reason, and understand.", 'Reading to young children supports their cognitive development.', 'Education', ['mental development'], ['early cognitive development'], '/ˈkɒɡnɪtɪv dɪˈvɛləpmənt/', 'hard'),
  w('proficiency', 'A high degree of skill or competence in something.', 'Applicants must demonstrate proficiency in English before enrolling on the course.', 'Education', ['competence', 'skill'], ['language proficiency', 'proficiency test'], '/prəˈfɪʃənsi/', 'medium'),

  // Technology (additional)
  w('algorithm', 'A precise set of rules or steps used to solve a problem or perform a task.', 'The app uses an algorithm to recommend videos based on viewing history.', 'Technology', ['formula', 'procedure'], ['complex algorithm', 'run an algorithm'], '/ˈælɡərɪðəm/', 'medium'),
  w('artificial', 'Made or produced by human beings rather than occurring naturally.', 'Some critics worry that artificial substitutes cannot fully replace natural resources.', 'Technology', ['synthetic', 'man-made'], ['artificial substitute', 'artificial material'], '/ˌɑːtɪˈfɪʃl/', 'easy'),
  w('digital divide', 'The gap between people with easy access to digital technology and those without.', 'The digital divide became especially apparent when schools moved lessons online.', 'Technology', ['tech gap'], ['bridge the digital divide', 'widen the digital divide'], '/ˈdɪdʒɪtl daɪˈvaɪd/', 'hard'),
  w('innovation', 'The introduction of new ideas, methods, or products.', 'Constant innovation has allowed the company to stay ahead of its competitors.', 'Technology', ['invention', 'novelty'], ['drive innovation', 'technological innovation'], '/ˌɪnəˈveɪʃn/', 'medium'),
  w('malware', 'Software designed to damage or gain unauthorised access to a computer system.', "The company's servers were infected with malware that stole customer data.", 'Technology', ['malicious software'], ['malware attack', 'detect malware'], '/ˈmælweə/', 'medium'),
  w('bandwidth', 'The capacity of a network to transmit data over a given time.', 'Streaming high-definition video requires a large amount of bandwidth.', 'Technology', ['data capacity'], ['limited bandwidth', 'bandwidth usage'], '/ˈbændwɪdθ/', 'medium'),
  w('artificial limb', 'A prosthetic device that replaces a missing arm or leg.', 'Advances in robotics have made artificial limbs far more responsive than before.', 'Technology', ['prosthetic'], ['fit an artificial limb'], '/ˌɑːtɪˈfɪʃl lɪm/', 'hard'),
  w('encryption', 'The process of converting information into a code to prevent unauthorised access.', "Banks rely on strong encryption to protect customers' financial details.", 'Technology', ['data encoding'], ['end-to-end encryption', 'encryption technology'], '/ɪnˈkrɪpʃn/', 'hard'),
  w('user-friendly', 'Easy for most people to use or understand.', 'The new interface is far more user-friendly than the previous version.', 'Technology', ['intuitive', 'accessible'], ['user-friendly design', 'user-friendly interface'], '/ˈjuːzə ˈfrɛndli/', 'easy'),
  w('artificial neural network', 'A computing system loosely modelled on the human brain, used in AI.', 'Artificial neural networks power many modern image-recognition applications.', 'Technology', ['neural net'], ['train a neural network'], '/ˌɑːtɪˈfɪʃl ˈnjʊərəl ˈnɛtwɜːk/', 'hard'),
  w('e-commerce', 'The buying and selling of goods and services over the internet.', 'E-commerce has transformed the way small businesses reach global customers.', 'Technology', ['online trade'], ['e-commerce platform', 'growth of e-commerce'], '/iː ˈkɒmɜːs/', 'easy'),

  // Environment (additional)
  w('greenhouse gas', 'A gas that traps heat in the atmosphere, contributing to global warming.', 'Carbon dioxide is the most abundant greenhouse gas produced by human activity.', 'Environment', ['emission'], ['greenhouse gas emissions', 'reduce greenhouse gases'], '/ˈɡriːnhaʊs ɡæs/', 'medium'),
  w('depletion', 'The reduction in the amount of something, especially a natural resource.', 'The depletion of fish stocks has forced many coastal communities to change their livelihoods.', 'Environment', ['exhaustion', 'reduction'], ['resource depletion', 'ozone depletion'], '/dɪˈpliːʃn/', 'hard'),
  w('conservation', 'The protection and preservation of the natural environment.', 'The national park was established to support the conservation of endangered species.', 'Environment', ['preservation'], ['wildlife conservation', 'conservation effort'], '/ˌkɒnsəˈveɪʃn/', 'medium'),
  w('emission', 'A substance, especially gas, that is released into the air.', 'Stricter regulations have helped to cut vehicle emissions in major cities.', 'Environment', ['discharge', 'output'], ['carbon emission', 'reduce emissions'], '/ɪˈmɪʃn/', 'medium'),
  w('ecosystem', 'A community of living organisms interacting with their physical environment.', 'Coral reefs support one of the most diverse ecosystems on the planet.', 'Environment', ['habitat system'], ['fragile ecosystem', 'damage an ecosystem'], '/ˈiːkəʊsɪstəm/', 'medium'),
  w('drought', 'A prolonged period of abnormally low rainfall.', 'The region has suffered repeated droughts, devastating local agriculture.', 'Environment', ['dry spell'], ['severe drought', 'drought conditions'], '/draʊt/', 'easy'),
  w('pollutant', 'A substance that contaminates air, water, or soil.', 'Factories are required to filter harmful pollutants before releasing waste water.', 'Environment', ['contaminant'], ['airborne pollutant', 'release pollutants'], '/pəˈluːtənt/', 'medium'),
  w('extinction', 'The state or process of a species dying out completely.', 'Habitat destruction is pushing many species closer to extinction.', 'Environment', ['dying out'], ['brink of extinction', 'mass extinction'], '/ɪkˈstɪŋkʃn/', 'medium'),
  w('recycling', 'The process of converting waste into reusable material.', 'The city introduced a new recycling scheme to reduce landfill waste.', 'Environment', ['reprocessing'], ['recycling scheme', 'recycling rate'], '/riːˈsaɪklɪŋ/', 'easy'),
  w('carbon-neutral', 'Achieving net-zero carbon dioxide emissions.', 'The airline has pledged to become carbon-neutral within the next two decades.', 'Environment', ['net-zero'], ['carbon-neutral target', 'go carbon-neutral'], '/ˈkɑːbən ˈnjuːtrəl/', 'hard'),

  // Health (additional)
  w('obesity', 'The condition of being extremely overweight, posing health risks.', 'Childhood obesity has risen sharply alongside greater consumption of processed food.', 'Health', ['excess weight'], ['tackle obesity', 'obesity rate'], '/əʊˈbiːsəti/', 'medium'),
  w('immune system', "The body's defence system against disease and infection.", 'A balanced diet helps to strengthen the immune system.', 'Health', ["body's defences"], ['boost the immune system', 'weakened immune system'], '/ɪˈmjuːn ˈsɪstəm/', 'medium'),
  w('chronic illness', 'A long-lasting medical condition that often cannot be fully cured.', 'Managing a chronic illness often requires long-term lifestyle changes.', 'Health', ['long-term condition'], ['suffer from a chronic illness', 'chronic illness management'], '/ˈkrɒnɪk ˈɪlnəs/', 'medium'),
  w('vaccination', 'The administration of a vaccine to produce immunity to a disease.', 'Widespread vaccination has dramatically reduced deaths from infectious diseases.', 'Health', ['immunisation'], ['vaccination programme', 'receive a vaccination'], '/ˌvæksɪˈneɪʃn/', 'easy'),
  w('mental well-being', 'A state of good psychological and emotional health.', "Employers are increasingly aware of the importance of employees' mental well-being.", 'Health', ['psychological health'], ['support mental well-being', 'mental well-being programme'], '/ˈmɛntl wɛl ˈbiːɪŋ/', 'medium'),
  w('sedative', 'A drug that has a calming or sleep-inducing effect.', 'The patient was given a mild sedative before the procedure.', 'Health', ['tranquilliser'], ['prescribe a sedative', 'mild sedative'], '/ˈsɛdətɪv/', 'hard'),
  w('nutritious', 'Providing the substances necessary for health and growth.', 'Schools are being encouraged to serve more nutritious meals at lunchtime.', 'Health', ['healthy', 'nourishing'], ['nutritious diet', 'nutritious meal'], '/njuːˈtrɪʃəs/', 'easy'),
  w('stress-related', 'Caused by or connected with psychological or physical stress.', 'Stress-related illnesses account for a growing proportion of workplace absences.', 'Health', ['stress-induced'], ['stress-related illness', 'stress-related symptoms'], '/strɛs rɪˈleɪtɪd/', 'medium'),
  w('well-being', 'The state of being comfortable, healthy, or happy.', 'Regular exercise contributes significantly to overall well-being.', 'Health', ['welfare'], ['sense of well-being', 'promote well-being'], '/wɛl ˈbiːɪŋ/', 'easy'),

  // Work (additional)
  w('remuneration', 'Money paid for work or a service.', 'The job offers generous remuneration alongside a range of other benefits.', 'Work', ['pay', 'compensation'], ['financial remuneration', 'remuneration package'], '/rɪˌmjuːnəˈreɪʃn/', 'hard'),
  w('recruitment', 'The process of finding and hiring new employees.', 'The firm has overhauled its recruitment process to attract more diverse candidates.', 'Work', ['hiring'], ['recruitment process', 'graduate recruitment'], '/rɪˈkruːtmənt/', 'medium'),
  w('promotion', 'Advancement to a higher position or rank within an organisation.', 'She received a promotion after leading the project successfully.', 'Work', ['advancement'], ['gain a promotion', 'promotion prospects'], '/prəˈməʊʃn/', 'easy'),
  w('job security', 'The likelihood of an employee keeping their job without risk of unemployment.', 'Many workers value job security over a higher salary.', 'Work', ['employment stability'], ['lack of job security', 'offer job security'], '/dʒɒb sɪˈkjʊərəti/', 'medium'),
  w('overtime', 'Time worked in addition to normal working hours.', 'Employees are paid extra for any overtime they work during busy periods.', 'Work', ['extra hours'], ['work overtime', 'unpaid overtime'], '/ˈəʊvətaɪm/', 'easy'),
  w('freelance', 'Working independently for various employers rather than being employed by one.', 'More professionals are choosing to freelance rather than commit to a single employer.', 'Work', ['self-employed'], ['freelance work', 'freelance career'], '/ˈfriːlɑːns/', 'medium'),
  w('burnout', 'A state of physical or emotional exhaustion caused by prolonged stress.', 'Excessive overtime can eventually lead to employee burnout.', 'Work', ['exhaustion'], ['suffer from burnout', 'prevent burnout'], '/ˈbɜːnaʊt/', 'medium'),
  w('qualification', 'A skill or achievement that makes someone suitable for a job or task.', "A relevant qualification can significantly improve a candidate's job prospects.", 'Work', ['credential'], ['professional qualification', 'lack qualifications'], '/ˌkwɒlɪfɪˈkeɪʃn/', 'easy'),

  // Society (additional)
  w('welfare state', 'A system where the government protects the economic and social well-being of citizens.', 'The welfare state provides a safety net for those who lose their jobs.', 'Society', ['social safety net'], ['welfare state provision', 'expand the welfare state'], '/ˈwɛlfeə steɪt/', 'hard'),
  w('discrimination', 'Unjust treatment of people based on characteristics such as race or gender.', 'Anti-discrimination laws aim to ensure equal treatment in the workplace.', 'Society', ['prejudice'], ['racial discrimination', 'combat discrimination'], '/dɪˌskrɪmɪˈneɪʃn/', 'medium'),
  w('gender equality', 'The state of equal rights and opportunities for all genders.', 'Progress towards gender equality has been slow in some industries.', 'Society', ['gender parity'], ['achieve gender equality', 'gender equality gap'], '/ˈdʒɛndə iːˈkwɒləti/', 'medium'),
  w('ageing population', 'A population with an increasing proportion of older people.', 'An ageing population places growing pressure on healthcare and pension systems.', 'Society', ['greying population'], ['rapidly ageing population'], '/ˈeɪdʒɪŋ ˌpɒpjʊˈleɪʃn/', 'hard'),
  w('welfare benefits', 'Government payments given to support those in financial need.', 'Cuts to welfare benefits have disproportionately affected low-income families.', 'Society', ['state benefits'], ['claim welfare benefits', 'cut welfare benefits'], '/ˈwɛlfeə ˈbɛnɪfɪts/', 'medium'),
  w('community', 'A group of people living in the same area or sharing common interests.', 'Volunteering can help newcomers feel part of the local community.', 'Society', ['neighbourhood'], ['local community', 'sense of community'], '/kəˈmjuːnɪti/', 'easy'),
  w('stereotype', 'A widely held but oversimplified idea about a type of person or thing.', 'The advertisement was criticised for reinforcing outdated gender stereotypes.', 'Society', ['generalisation'], ['reinforce a stereotype', 'break a stereotype'], '/ˈstɛriətaɪp/', 'medium'),

  // Travel (additional)
  w('sustainable tourism', 'Tourism that minimises negative impact on the environment and local culture.', 'Sustainable tourism initiatives encourage visitors to respect local ecosystems.', 'Travel', ['eco-tourism'], ['promote sustainable tourism'], '/səˈsteɪnəbl ˈtʊərɪzəm/', 'hard'),
  w('destination', 'A place to which someone is travelling.', 'The island has become a popular destination for adventure tourists.', 'Travel', ['location'], ['popular destination', 'holiday destination'], '/ˌdɛstɪˈneɪʃn/', 'easy'),
  w('landmark', 'A recognisable feature of a landscape, often a building of historic importance.', "Tourists flock to the city's famous landmark every summer.", 'Travel', ['monument'], ['famous landmark', 'historic landmark'], '/ˈlændmɑːk/', 'easy'),
  w('backpacking', 'Travelling with a backpack, typically on a low budget.', 'Backpacking around Southeast Asia is a popular gap-year activity.', 'Travel', ['budget travel'], ['go backpacking', 'backpacking trip'], '/ˈbækpækɪŋ/', 'easy'),
  w('overtourism', 'A situation where too many tourists visit a place, causing damage or overcrowding.', 'Overtourism has forced some cities to limit the number of daily visitors.', 'Travel', ['tourist overcrowding'], ['effects of overtourism', 'combat overtourism'], '/ˈəʊvətʊərɪzəm/', 'hard'),

  // Crime (additional)
  w('offender', 'A person who has committed a crime.', 'The programme aims to reduce reoffending among young offenders.', 'Crime', ['criminal'], ['young offender', 'repeat offender'], '/əˈfɛndə/', 'medium'),
  w('custodial sentence', 'A punishment involving imprisonment.', 'The judge handed down a custodial sentence of five years.', 'Crime', ['prison sentence'], ['receive a custodial sentence'], '/kʌˈstəʊdiəl ˈsɛntəns/', 'hard'),
  w('petty crime', 'Minor crime, such as small-scale theft.', 'Petty crime tends to rise in areas with high unemployment.', 'Crime', ['minor offence'], ['commit petty crime', 'petty crime rate'], '/ˈpɛti kraɪm/', 'medium'),
  w('cybercrime', 'Criminal activity carried out using computers or the internet.', 'Cybercrime has grown rapidly alongside increased reliance on online banking.', 'Crime', ['online crime'], ['rise in cybercrime', 'combat cybercrime'], '/ˈsaɪbəkraɪm/', 'medium'),

  // Culture (additional)
  w('tradition', 'A long-established custom or belief passed down within a group.', 'Many young people still observe traditions passed down from their grandparents.', 'Culture', ['custom'], ['maintain tradition', 'break with tradition'], '/trəˈdɪʃn/', 'easy'),
  w('preservation', 'The act of keeping something in its original state or protecting it from harm.', 'Preservation of historic buildings is a key concern for city planners.', 'Culture', ['conservation'], ['preservation of heritage', 'preservation effort'], '/ˌprɛzəˈveɪʃn/', 'medium'),
  w('folklore', 'Traditional beliefs, customs, and stories of a community, passed by word of mouth.', 'The museum exhibit explores local folklore and legends.', 'Culture', ['folk tradition'], ['local folklore', 'rooted in folklore'], '/ˈfəʊklɔː/', 'medium'),
  w('customs', 'Traditional practices particular to a society or place.', 'Visitors are encouraged to learn about local customs before travelling.', 'Culture', ['traditions', 'practices'], ['local customs', 'observe customs'], '/ˈkʌstəmz/', 'easy'),

  // Media (additional)
  w('sensationalism', 'The use of exciting or shocking stories at the expense of accuracy.', "Sensationalism in the press can distort the public's understanding of an issue.", 'Media', ['exaggerated reporting'], ['media sensationalism', 'accused of sensationalism'], '/sɛnˈseɪʃənəlɪzəm/', 'hard'),
  w('broadcast', 'To transmit a programme by television or radio.', 'The interview was broadcast live to millions of viewers.', 'Media', ['transmit', 'air'], ['broadcast live', 'television broadcast'], '/ˈbrɔːdkɑːst/', 'easy'),
  w('bias', 'A tendency to favour one perspective unfairly over another.', 'Readers should be aware of potential bias when consuming news from a single source.', 'Media', ['prejudice', 'partiality'], ['media bias', 'political bias'], '/ˈbaɪəs/', 'medium'),
  w('viral', 'Spreading rapidly and widely, especially online.', 'The video went viral within hours of being posted.', 'Media', ['widely shared'], ['go viral', 'viral video'], '/ˈvaɪərəl/', 'easy'),

  // Globalization (additional)
  w('multinational corporation', 'A large company that operates in multiple countries.', 'Multinational corporations often relocate production to countries with lower labour costs.', 'Globalization', ['transnational company'], ['multinational corporation headquarters'], '/ˌmʌltiˈnæʃənl ˌkɔːpəˈreɪʃn/', 'hard'),
  w('homogenisation', 'The process of becoming similar or the same, reducing diversity.', 'Some fear that globalisation is leading to the cultural homogenisation of youth around the world.', 'Globalization', ['standardisation'], ['cultural homogenisation'], '/həˌmɒdʒɪnaɪˈzeɪʃn/', 'hard'),
  w('trade barrier', 'A government restriction on international trade, such as a tariff.', 'Reducing trade barriers has boosted exports between the two countries.', 'Globalization', ['trade restriction'], ['remove trade barriers', 'impose trade barriers'], '/treɪd ˈbæriə/', 'medium'),

  // Family
  w('nuclear family', 'A family unit consisting of parents and their children only.', 'The traditional nuclear family is becoming less common in many societies.', 'Family', ['immediate family'], ['traditional nuclear family'], '/ˈnjuːkliə ˈfæmɪli/', 'medium'),
  w('extended family', 'A family that includes relatives beyond parents and children, such as grandparents.', 'In many cultures, the extended family plays an active role in raising children.', 'Family', ['wider family'], ['extended family network', 'close-knit extended family'], '/ɪkˈstɛndɪd ˈfæmɪli/', 'medium'),
  w('upbringing', 'The way a child is cared for and raised.', 'Her strict upbringing instilled a strong sense of discipline.', 'Family', ['rearing'], ['strict upbringing', 'happy upbringing'], '/ˈʌpbrɪŋɪŋ/', 'medium'),
  w('single-parent family', 'A family with only one parent raising the children.', 'Support services for single-parent families have expanded in recent years.', 'Family', ['one-parent household'], ['single-parent family support'], '/ˈsɪŋɡl ˈpeərənt ˈfæmɪli/', 'medium'),
  w('sibling', 'A brother or sister.', 'Only children sometimes miss out on the companionship siblings provide.', 'Family', ['brother or sister'], ['sibling rivalry', 'close to a sibling'], '/ˈsɪblɪŋ/', 'easy'),
  w('dependant', 'A person who relies on another, especially financially, for support.', 'Tax relief is available for employees who support a dependant.', 'Family', ['relative supported'], ['financial dependant', 'claim for a dependant'], '/dɪˈpɛndənt/', 'medium'),
  w('generation gap', 'A difference in attitudes between younger and older people.', 'The generation gap often becomes apparent in discussions about technology use.', 'Family', ['age divide'], ['bridge the generation gap', 'widening generation gap'], '/ˌdʒɛnəˈreɪʃn ɡæp/', 'medium'),
  w('childcare', 'The care of children, especially provided while parents are at work.', 'The rising cost of childcare has made it difficult for some parents to return to work.', 'Family', ['child-minding'], ['affordable childcare', 'childcare provision'], '/ˈtʃaɪldkeə/', 'easy'),

  // Economy
  w('inflation', 'A general and sustained rise in the prices of goods and services.', 'High inflation has eroded the purchasing power of many households.', 'Economy', ['rising prices'], ['high inflation', 'curb inflation'], '/ɪnˈfleɪʃn/', 'medium'),
  w('recession', 'A period of temporary economic decline during which trade and industry are reduced.', 'The country entered a recession after two consecutive quarters of negative growth.', 'Economy', ['economic downturn'], ['economic recession', 'recover from a recession'], '/rɪˈsɛʃn/', 'medium'),
  w('subsidy', 'Money granted by the government to help an industry or business.', 'Farmers rely on government subsidies to remain competitive with imported produce.', 'Economy', ['grant', 'financial support'], ['government subsidy', 'agricultural subsidy'], '/ˈsʌbsɪdi/', 'hard'),
  w('gross domestic product', 'The total value of goods and services produced by a country in a given period.', "The country's gross domestic product grew by three per cent last year.", 'Economy', ['GDP'], ['GDP growth', 'measure gross domestic product'], '/ɡrəʊs dəˈmɛstɪk ˈprɒdʌkt/', 'hard'),
  w('consumerism', 'The preoccupation with acquiring consumer goods.', 'Critics argue that rampant consumerism encourages unnecessary waste.', 'Economy', ['materialism'], ['rampant consumerism', 'consumerism culture'], '/kənˈsjuːmərɪzəm/', 'hard'),
  w('disposable income', 'Income remaining after taxes, available for spending or saving.', 'Rising rents have reduced the disposable income of many young professionals.', 'Economy', ['spare income'], ['increase in disposable income', 'low disposable income'], '/dɪˈspəʊzəbl ˈɪnkʌm/', 'hard'),
  w('monopoly', 'The exclusive control of a market by a single company.', 'Regulators intervened to prevent the company from forming a monopoly.', 'Economy', ['exclusive control'], ['create a monopoly', 'break up a monopoly'], '/məˈnɒpəli/', 'hard'),
  w('tariff', 'A tax imposed on imported or exported goods.', 'The government imposed a tariff on imported steel to protect local manufacturers.', 'Economy', ['import tax'], ['impose a tariff', 'tariff on imports'], '/ˈtærɪf/', 'medium'),
  w('privatisation', 'The transfer of a business or industry from public to private ownership.', 'The privatisation of the railway system sparked debate about service quality.', 'Economy', ['denationalisation'], ['railway privatisation', 'push for privatisation'], '/ˌpraɪvətaɪˈzeɪʃn/', 'hard'),

  // Science
  w('hypothesis', 'A proposed explanation made on the basis of limited evidence, to be tested further.', 'Researchers designed an experiment to test their hypothesis about plant growth.', 'Science', ['theory', 'proposition'], ['test a hypothesis', 'form a hypothesis'], '/haɪˈpɒθəsɪs/', 'medium'),
  w('genetic engineering', "The direct manipulation of an organism's genes using biotechnology.", 'Genetic engineering has enabled scientists to develop crops resistant to disease.', 'Science', ['gene editing'], ['genetic engineering technique'], '/dʒəˈnɛtɪk ˌɛndʒɪˈnɪərɪŋ/', 'hard'),
  w('empirical', 'Based on observation or experiment rather than theory alone.', 'The report relies on empirical evidence gathered from field studies.', 'Science', ['evidence-based'], ['empirical evidence', 'empirical research'], '/ɪmˈpɪrɪkl/', 'hard'),
  w('experiment', 'A scientific procedure carried out to test a hypothesis.', 'The class conducted a simple experiment to observe how plants respond to light.', 'Science', ['trial', 'test'], ['conduct an experiment', 'laboratory experiment'], '/ɪkˈspɛrɪmənt/', 'easy'),
  w('clinical trial', 'A research study testing a medical treatment on human volunteers.', 'The new vaccine passed several stages of clinical trial before approval.', 'Science', ['medical trial'], ['undergo a clinical trial', 'clinical trial results'], '/ˈklɪnɪkl ˈtraɪəl/', 'hard'),
  w('renewable resource', 'A natural resource that can be replenished naturally over time.', 'Solar power is a renewable resource that produces no direct emissions.', 'Science', ['sustainable resource'], ['renewable resource use'], '/rɪˈnjuːəbl rɪˈsɔːs/', 'medium'),
];

export const vocabularyTopics = Array.from(new Set(vocabularyWords.map((v) => v.topic)));
