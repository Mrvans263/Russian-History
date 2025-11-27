// utils/headerTexts.js
export const getHeaderTitle = (language) => {
  const titles = {
    russian: "История России для иностранных студентов",
    english: "Russian History for International Students", 
    french: "Histoire Russe pour Étudiants Internationaux",
    spanish: "Historia Rusa para Estudiantes Internacionales"
  };
  return titles[language] || titles.english;
};

export const getHeaderSubtitle = (language) => {
  const subtitles = {
    russian: "Изучайте богатую историю России через интерактивные уроки",
    english: "Explore the rich history of Russia through interactive lessons",
    french: "Explorez la riche histoire de la Russie à travers des leçons interactives",
    spanish: "Explora la rica historia de Rusia a través de lecciones interactivas"
  };
  return subtitles[language] || subtitles.english;
};