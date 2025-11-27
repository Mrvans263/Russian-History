// components/TopicList.js
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/Languages';
import './TopicList.css';

const TopicList = ({ onSelectTopic }) => {
  const { currentLanguage } = useLanguage();
  
  // Get dynamic headers based on current language
  const getListTitle = () => {
    const titles = {
      russian: "Учебные темы",
      english: "Learning Topics",
      french: "Sujets d'apprentissage", 
      spanish: "Temas de aprendizaje"
    };
    return titles[currentLanguage] || titles.english;
  };

  const getListSubtitle = () => {
    const subtitles = {
      russian: "Выберите тему для изучения истории России",
      english: "Select a topic to start learning Russian history",
      french: "Sélectionnez un sujet pour commencer à apprendre l'histoire russe",
      spanish: "Selecciona un tema para comenzar a aprender historia rusa"
    };
    return subtitles[currentLanguage] || subtitles.english;
  };

  const getProgressText = () => {
    const texts = {
      russian: "завершено",
      english: "complete",
      french: "terminé",
      spanish: "completado"
    };
    return texts[currentLanguage] || texts.english;
  };

  const getButtonText = (progress) => {
    if (progress > 0) {
      const texts = {
        russian: "Продолжить →",
        english: "Continue →",
        french: "Continuer →",
        spanish: "Continuar →"
      };
      return texts[currentLanguage] || texts.english;
    } else {
      const texts = {
        russian: "Начать обучение →",
        english: "Start Learning →",
        french: "Commencer l'apprentissage →",
        spanish: "Comenzar a aprender →"
      };
      return texts[currentLanguage] || texts.english;
    }
  };

  // Get progress from localStorage
  const getTopicProgress = (topicId) => {
    const progress = localStorage.getItem(`topic_${topicId}_progress`);
    return progress ? parseInt(progress) : 0;
  };

  // All topics with minimal preview data
  const topics = [
    {
      id: 1,
      title: {
        russian: "Лекция 1. История как наука",
        english: "Lecture 1. History as a Science: Methodology and Historical Thinking",
        french: "Leçon 1. L'histoire comme science : Méthodologie et pensée historique",
        spanish: "Lección 1. La historia como ciencia: Metodología y pensamiento histórico"
      },
      description: {
        russian: "Введение в методологию исторической науки и изучение истории",
        english: "Introduction to historical methodology and the study of history",
        french: "Introduction à la méthodologie historique et à l'étude de l'histoire",
        spanish: "Introducción a la metodología histórica y al estudio de la historia"
      }
    },
    {
      id: 2,
      title: {
        russian: "Лекция 2. Мир в древности и раннем Средневековье",
        english: "Lecture 2. The Ancient World & Early Middle Ages",
        french: "Leçon 2. Le monde dans l'Antiquité et le haut Moyen Âge", 
        spanish: "Lección 2. El mundo en la Antigüedad y Alta Edad Media"
      },
      description: {
        russian: "Изучение древних цивилизаций и раннего средневекового периода",
        english: "Explore ancient civilizations and the early medieval period",
        french: "Explorez les civilisations anciennes et la période médiévale précoce",
        spanish: "Explora civilizaciones antiguas y el período medieval temprano"
      }
    },
    {
      id: 3,
      title: {
        russian: "Лекция 3. Образование государства Русь",
        english: "Lecture 3. Formation of the Rus' State",
        french: "Leçon 3. Formation de l'État de la Rus'",
        spanish: "Lección 3. Formación del Estado de la Rus"
      },
      description: {
        russian: "Происхождение и становление первого русского государства",
        english: "The origins and establishment of the first Russian state",
        french: "Les origines et la création du premier État russe",
        spanish: "Los orígenes y establecimiento del primer estado ruso"
      }
    },
    {
      id: 4,
      title: {
        russian: "Лекция 4. Русские земли в XIII-XV вв.",
        english: "Lecture 4. Russian Lands in the 13th-15th Centuries",
        french: "Leçon 4. Les terres russes aux XIIIe-XVe siècles",
        spanish: "Lección 4. Tierras rusas en los siglos XIII-XV"
      },
      description: {
        russian: "Русские земли в период монгольского владычества и возвышения Москвы",
        english: "Russian lands during Mongol rule and the rise of Moscow",
        french: "Terres russes pendant la domination mongole et l'ascension de Moscou",
        spanish: "Tierras rusas durante el dominio mongol y el ascenso de Moscú"
      }
    },
    {
      id: 5,
      title: {
        russian: "Лекция 5. Становление Московского государства",
        english: "Lecture 5. Formation of the Muscovite State",
        french: "Leçon 5. Formation de l'État moscovite",
        spanish: "Lección 5. Formación del Estado moscovita"
      },
      description: {
        russian: "Централизация русских земель вокруг Москвы",
        english: "Centralization of Russian lands around Moscow",
        french: "Centralisation des terres russes autour de Moscou",
        spanish: "Centralización de las tierras rusas alrededor de Moscú"
      }
    },
    {
      id: 6,
      title: {
        russian: "Лекция 6. Россия и мир в начале эпохи Нового времени",
        english: "Lecture 6. Russia and the World in the Early Modern Era",
        french: "Leçon 6. La Russie et le monde au début de l'époque moderne",
        spanish: "Lección 6. Rusia y el mundo en la era moderna temprana"
      },
      description: {
        russian: "Россия в контексте глобальных изменений начала Нового времени",
        english: "Russia in the context of global changes in the early modern era",
        french: "La Russie dans le contexte des changements mondiaux du début de l'époque moderne",
        spanish: "Rusia en el contexto de los cambios globales de la era moderna temprana"
      }
    },
    {
      id: 7,
      title: {
        russian: "Лекция 7. Россия и мир в конце XVI-XVII вв.",
        english: "Lecture 7. Russia and the World in the Late 16th-17th Centuries",
        french: "Leçon 7. La Russie et le monde à la fin du XVIe-XVIIe siècles",
        spanish: "Lección 7. Rusia y el mundo a finales de los siglos XVI-XVII"
      },
      description: {
        russian: "Смутное время и укрепление российского государства",
        english: "Time of Troubles and strengthening of the Russian state",
        french: "Temps des Troubles et renforcement de l'État russe",
        spanish: "Tiempo de Problemas y fortalecimiento del estado ruso"
      }
    },
    {
      id: 8,
      title: {
        russian: "Лекция 8. XVIII в. в мировой истории",
        english: "Lecture 8. The 18th Century in World History",
        french: "Leçon 8. Le XVIIIe siècle dans l'histoire mondiale",
        spanish: "Lección 8. El siglo XVIII en la historia mundial"
      },
      description: {
        russian: "Эпоха Просвещения и мировые преобразования",
        english: "Age of Enlightenment and global transformations",
        french: "Siècle des Lumières et transformations mondiales",
        spanish: "Edad de la Ilustración y transformaciones globales"
      }
    },
    {
      id: 9,
      title: {
        russian: "Лекция 9. Россия в эпоху Петра I и «дворцовых переворотов»",
        english: "Lecture 9. Russia in the Era of Peter I and 'Palace Coups'",
        french: "Leçon 9. La Russie à l'époque de Pierre Ier et des 'coups de palais'",
        spanish: "Lección 9. Rusia en la era de Pedro I y los 'golpes de palacio'"
      },
      description: {
        russian: "Петровские реформы и эпоха дворцовых переворотов",
        english: "Peter's reforms and the era of palace coups",
        french: "Réformes de Pierre et l'ère des coups de palais",
        spanish: "Reformas de Pedro y la era de los golpes de palacio"
      }
    },
    {
      id: 10,
      title: {
        russian: "Лекция 10. Просвещенный абсолютизм в Европе и России",
        english: "Lecture 10. Enlightened Absolutism in Europe and Russia",
        french: "Leçon 10. L'absolutisme éclairé en Europe et en Russie",
        spanish: "Lección 10. El absolutismo ilustrado en Europa y Rusia"
      },
      description: {
        russian: "Политика просвещенного абсолютизма Екатерины II",
        english: "Enlightened absolutism policies of Catherine II",
        french: "Politiques d'absolutisme éclairé de Catherine II",
        spanish: "Políticas de absolutismo ilustrado de Catalina II"
      }
    },
    {
      id: 11,
      title: {
        russian: "Лекция 11. Внешняя политика во второй половине XVIII в.",
        english: "Lecture 11. Foreign Policy in the Second Half of the 18th Century",
        french: "Leçon 11. Politique étrangère dans la seconde moitié du XVIIIe siècle",
        spanish: "Lección 11. Política exterior en la segunda mitad del siglo XVIII"
      },
      description: {
        russian: "Внешнеполитические успехи Российской империи",
        english: "Foreign policy successes of the Russian Empire",
        french: "Succès de la politique étrangère de l'Empire russe",
        spanish: "Éxitos de la política exterior del Imperio Ruso"
      }
    },
    {
      id: 12,
      title: {
        russian: "Лекция 12. Российская империя в первой четверти XIX в.",
        english: "Lecture 12. The Russian Empire in the First Quarter of the 19th Century",
        french: "Leçon 12. L'Empire russe dans le premier quart du XIXe siècle",
        spanish: "Lección 12. El Imperio Ruso en el primer cuarto del siglo XIX"
      },
      description: {
        russian: "Россия в эпоху Наполеоновских войн и Александра I",
        english: "Russia in the era of Napoleonic Wars and Alexander I",
        french: "La Russie à l'époque des guerres napoléoniennes et d'Alexandre Ier",
        spanish: "Rusia en la era de las Guerras Napoleónicas y Alejandro I"
      }
    },
    {
      id: 13,
      title: {
        russian: "Лекция 13. Российская империя во второй четверти XIX в.",
        english: "Lecture 13. The Russian Empire in the Second Quarter of the 19th Century",
        french: "Leçon 13. L'Empire russe dans le deuxième quart du XIXe siècle",
        spanish: "Lección 13. El Imperio Ruso en el segundo cuarto del siglo XIX"
      },
      description: {
        russian: "Эпоха Николая I и развитие общественной мысли",
        english: "Era of Nicholas I and development of social thought",
        french: "Ère de Nicolas Ier et développement de la pensée sociale",
        spanish: "Era de Nicolás I y desarrollo del pensamiento social"
      }
    },
    {
      id: 14,
      title: {
        russian: "Лекция 14. «Великие реформы» в истории России",
        english: "Lecture 14. The 'Great Reforms' in Russian History",
        french: "Leçon 14. Les 'Grandes Réformes' dans l'histoire russe",
        spanish: "Lección 14. Las 'Grandes Reformas' en la historia rusa"
      },
      description: {
        russian: "Либеральные реформы Александра II",
        english: "Liberal reforms of Alexander II",
        french: "Réformes libérales d'Alexandre II",
        spanish: "Reformas liberales de Alejandro II"
      }
    },
    {
      id: 15,
      title: {
        russian: "Лекция 15. Российская империя на рубеже XIX-XX вв.",
        english: "Lecture 15. The Russian Empire at the Turn of the 20th Century",
        french: "Leçon 15. L'Empire russe au tournant du XXe siècle",
        spanish: "Lección 15. El Imperio Ruso a finales del siglo XIX y principios del XX"
      },
      description: {
        russian: "Россия в период промышленной модернизации",
        english: "Russia during industrial modernization",
        french: "La Russie pendant la modernisation industrielle",
        spanish: "Rusia durante la modernización industrial"
      }
    },
    {
      id: 16,
      title: {
        russian: "Лекция 16. Россия в начале XX в. Первая мировая война",
        english: "Lecture 16. Russia in the Early 20th Century. World War I",
        french: "Leçon 16. La Russie au début du XXe siècle. Première Guerre mondiale",
        spanish: "Lección 16. Rusia a principios del siglo XX. Primera Guerra Mundial"
      },
      description: {
        russian: "Россия в Первой мировой войне и революционный кризис",
        english: "Russia in World War I and the revolutionary crisis",
        french: "La Russie dans la Première Guerre mondiale et la crise révolutionnaire",
        spanish: "Rusia en la Primera Guerra Mundial y la crisis revolucionaria"
      }
    }
  ];

  return (
    <div className="topic-list">
      <div className="topics-header">
        <h2>{getListTitle()}</h2>
        <p>{getListSubtitle()}</p>
      </div>
      
      <div className="topics-grid">
        {topics.map(topic => {
          const progress = getTopicProgress(topic.id);
          const progressText = getProgressText();
          const buttonText = getButtonText(progress);
          
          return (
            <div 
              key={topic.id} 
              className="topic-card"
              onClick={() => onSelectTopic(topic)}
            >
              <div className="topic-number">
                {currentLanguage === 'russian' ? 'Лекция' : 'Lecture'} {topic.id}
              </div>
              <div className="topic-content">
                <h3>{getText(topic.title, currentLanguage)}</h3>
                <p className="russian-title">{topic.title.russian}</p>
                <p className="topic-description">{getText(topic.description, currentLanguage)}</p>
                
                <div className="topic-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span>{progress}% {progressText}</span>
                </div>
              </div>
              
              <div className="topic-actions">
                <button className="start-button">
                  {buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicList;