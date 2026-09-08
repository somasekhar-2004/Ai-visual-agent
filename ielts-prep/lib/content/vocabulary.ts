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
];

export const vocabularyTopics = Array.from(new Set(vocabularyWords.map((v) => v.topic)));
