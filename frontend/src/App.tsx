import {
  ArrowRight,
  Building2,
  CircleHelp,
  Coffee,
  Leaf,
  MapPin,
  Package,
  Store,
  Truck,
  Users,
} from "lucide-react";

const audienceCards = [
  {
    title: "Кофейни с 1 точкой",
    description: "Для команд, которым нужен понятный месячный цикл закупок без постоянных переписок с разными поставщиками.",
    icon: Store,
  },
  {
    title: "Небольшие сети",
    description: "Для проектов, где важно заранее понимать объём, логистику и условия по нескольким точкам.",
    icon: Building2,
  },
  {
    title: "Бары и пекарни с кофейной картой",
    description: "Для заведений, где кофе и сопутствующие категории нужно держать в стабильном операционном ритме.",
    icon: Coffee,
  },
  {
    title: "Команды с регулярными закупками",
    description: "Для тех, кому нужен не разовый заказ, а рабочая система поставок на месяц вперёд.",
    icon: Users,
  },
];

const productCategories = [
  {
    title: "Кофе Tasty Coffee",
    description: "Зерно для рабочих и сезонных карт с понятной логикой по объёму и планированию поставок.",
    icon: Coffee,
  },
  {
    title: "Сиропы Herbarista",
    description: "Базовые и сезонные позиции для барной карты без постоянного ручного согласования заказов.",
    icon: Package,
  },
  {
    title: "Чай",
    description: "Категория для кофеен и баров, которым важно собирать чайную полку в одном закупочном цикле.",
    icon: Leaf,
  },
  {
    title: "Расходники",
    description: "Подключаем актуальные расходные позиции там, где они действительно входят в рабочий формат закупки.",
    icon: Truck,
  },
];

const workflowSteps = [
  "Кофейня оставляет заявку.",
  "Мы уточняем объём и категории.",
  "Подбираем формат участия.",
  "Клиент входит в ближайший закупочный цикл.",
  "Поставки идут по согласованному графику.",
];

const faqs = [
  {
    question: "Почему подключение 1–5 числа?",
    answer:
      "Так мы собираем общий объём, планируем закупки и логистику по Казани заранее. За счёт этого условия становятся понятнее и предсказуемее для кофейни.",
  },
  {
    question: "Что если я хочу подключиться в середине месяца?",
    answer:
      "Оставить заявку можно в любой день. Если регулярный цикл уже закрыт, мы обсудим стартовый формат или подключим вас к следующему окну 1–5 числа.",
  },
  {
    question: "Можно ли сделать пробный заказ?",
    answer:
      "Такой сценарий обсуждается отдельно. Мы смотрим на категорию товара, объём и задачу точки, чтобы предложить адекватный формат входа.",
  },
  {
    question: "Условия в Казани такие же, как в Ульяновске?",
    answer:
      "Нет, Казань запускается как отдельный региональный цикл. Доставка, сроки, доступность категорий и детали условий уточняются по Казани отдельно.",
  },
  {
    question: "Что если у меня несколько точек?",
    answer:
      "Для нескольких точек и крупного объёма условия обсуждаются индивидуально. Здесь важны адреса, частота поставок и суммарный объём.",
  },
  {
    question: "Можно ли заказать только сиропы или только чай?",
    answer:
      "Да, такой формат возможен. Мы смотрим на состав заявки и подбираем вариант участия без обещаний одинаковых условий для любой категории и любого объёма.",
  },
  {
    question: "Как узнать цены?",
    answer:
      "Цены и условия обсуждаются после заявки, когда понятны объём, категории товаров и логистика по Казани.",
  },
  {
    question: "Что если товара нет?",
    answer:
      "Если по какой-то позиции есть ограничение у поставщика, мы заранее сообщаем об этом и предлагаем рабочую замену или корректировку закупочного плана.",
  },
];

const primaryCtas = [
  "Получить условия для Казани",
  "Обсудить закупку для моей кофейни",
  "Рассчитать условия по объёму",
];

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-porcelain)] text-[var(--color-ink)]">
      <main className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <section className="landing-shell overflow-hidden">
          <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-line)] bg-white/85 px-3 py-1.5 text-xs font-semibold text-[var(--color-olive)] shadow-sm">
                  <MapPin size={14} />
                  Отдельный региональный цикл для Казани
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    Supply Club Казань
                  </p>
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
                    Закупочная подписка для кофеен Казани
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
                    Кофе, чай, сиропы и расходники по понятному плановому циклу — без хаоса с
                    наличием и постоянных поисков поставщиков.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {primaryCtas.map((label, index) => (
                    <a
                      key={label}
                      href="#lead-form"
                      className={
                        index === 0
                          ? "cta-primary"
                          : "cta-secondary"
                      }
                    >
                      {label}
                      <ArrowRight size={16} />
                    </a>
                  ))}
                </div>

                <p className="max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
                  Запуск регионального цикла. Условия зависят от объёма, категорий товаров и
                  логистики по Казани.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="stat-card">
                  <span className="stat-label">Формат</span>
                  <strong className="stat-value">Pre-sale</strong>
                  <p className="stat-copy">Сейчас собираем заявки и первые разговоры с кофейнями Казани.</p>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Логика</span>
                  <strong className="stat-value">Плановый цикл</strong>
                  <p className="stat-copy">Без обещаний мгновенной доставки и одинаковых условий для всех.</p>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Подключение</span>
                  <strong className="stat-value">Окно 1–5</strong>
                  <p className="stat-copy">Для предсказуемых закупок, маршрутов и рабочих договорённостей.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="hero-visual min-h-[320px] sm:min-h-[380px]">
                <img
                  src="/brand/interior-2.jpg"
                  alt="Кофейное пространство"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,35,27,0.08)_0%,rgba(31,35,27,0.68)_100%)]" />
                <div className="relative z-10 mt-auto space-y-3 p-5 text-white sm:p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    <CircleHelp size={14} />
                    Kazan-first landing
                  </div>
                  <h2 className="max-w-sm text-2xl font-semibold tracking-[-0.03em]">
                    Не маркетплейс и не разовая витрина товаров
                  </h2>
                  <p className="max-w-md text-sm leading-6 text-white/84">
                    Это плановая закупочная система с понятными правилами, где объём, логистика и
                    формат участия обсуждаются заранее.
                  </p>
                </div>
              </div>

              <div className="info-panel">
                <div className="info-panel-header">
                  <span>Региональные правила Казани</span>
                </div>
                <ul className="space-y-3 text-sm leading-6 text-[var(--color-muted)]">
                  <li>Казань запускается как отдельный региональный цикл.</li>
                  <li>Условия могут отличаться от Ульяновска.</li>
                  <li>Доставка, сроки и доступность категорий уточняются по Казани отдельно.</li>
                  <li>Крупные объёмы и несколько точек обсуждаются индивидуально.</li>
                  <li>Список доступных категорий может расширяться по мере запуска.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="section-kicker">Для кого</p>
            <h2 className="section-title">Подходит для команд, которым нужна рабочая система закупок</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {audienceCards.map(({ title, description, icon: Icon }) => (
              <article key={title} className="surface-card">
                <div className="icon-wrap">
                  <Icon size={20} />
                </div>
                <h3 className="card-title">{title}</h3>
                <p className="card-copy">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="section-kicker">Категории</p>
            <h2 className="section-title">Какие товары можно обсуждать в региональном цикле</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {productCategories.map(({ title, description, icon: Icon }) => (
              <article key={title} className="surface-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="card-title">{title}</h3>
                    <p className="card-copy mt-2">{description}</p>
                  </div>
                  <div className="icon-wrap shrink-0">
                    <Icon size={20} />
                  </div>
                </div>
              </article>
            ))}
            <article className="surface-card border-dashed border-[var(--color-olive-soft)] bg-[var(--color-card-alt)]">
              <h3 className="card-title">Дополнительные категории позже</h3>
              <p className="card-copy mt-2">
                На старте не обещаем одинаковый каталог для любого объёма. Если у кофейни есть
                особый запрос, мы оцениваем его отдельно и добавляем только реалистичные сценарии.
              </p>
            </article>
          </div>
        </section>

        <section className="section-grid">
          <article className="surface-card surface-card-large">
            <div className="section-heading">
              <p className="section-kicker">Как работает</p>
              <h2 className="section-title">Пять шагов до понятного закупочного цикла</h2>
            </div>
            <ol className="space-y-4">
              {workflowSteps.map((step, index) => (
                <li key={step} className="workflow-step">
                  <span className="workflow-index">{index + 1}</span>
                  <p className="workflow-copy">{step}</p>
                </li>
              ))}
            </ol>
          </article>

          <article className="surface-card surface-card-large">
            <div className="section-heading">
              <p className="section-kicker">Почему 1–5 число</p>
              <h2 className="section-title">Это даёт кофейне более предсказуемые условия</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="benefit-card">
                <h3 className="benefit-title">Собираем общий объём</h3>
                <p className="benefit-copy">Проще планировать закупку под реальные потребности точек, а не в аварийном режиме.</p>
              </div>
              <div className="benefit-card">
                <h3 className="benefit-title">Планируем поставки</h3>
                <p className="benefit-copy">Маршруты и сроки становятся понятнее, когда цикл собран в начале месяца.</p>
              </div>
              <div className="benefit-card">
                <h3 className="benefit-title">Выстраиваем логистику</h3>
                <p className="benefit-copy">Учитываем районы, объём и формат работы точки до старта поставок.</p>
              </div>
              <div className="benefit-card">
                <h3 className="benefit-title">Делаем условия предсказуемыми</h3>
                <p className="benefit-copy">Кофейне не нужно каждую неделю заново выяснять доступность и базовые договорённости.</p>
              </div>
            </div>
          </article>
        </section>

        <section className="section-grid">
          <article className="surface-card surface-card-large">
            <div className="section-heading">
              <p className="section-kicker">Если вы пришли в середине месяца</p>
              <h2 className="section-title">Подключение всё равно возможно</h2>
            </div>
            <p className="text-base leading-7 text-[var(--color-muted)]">
              Вы можете оставить заявку в любой день. Если регулярный цикл уже закрыт, мы обсудим
              стартовый формат или подключим вас к следующему окну 1–5 числа.
            </p>
          </article>

          <article className="surface-card surface-card-large">
            <div className="section-heading">
              <p className="section-kicker">Несколько точек</p>
              <h2 className="section-title">Для сетей и крупного объёма нужен отдельный расчёт</h2>
            </div>
            <p className="text-base leading-7 text-[var(--color-muted)]">
              Если у вас несколько точек или крупный объём, условия обсуждаются индивидуально.
              Здесь важны адреса, частота поставок, категории товаров и общий месячный объём.
            </p>
          </article>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="section-kicker">FAQ</p>
            <h2 className="section-title">Частые вопросы по запуску Supply Club в Казани</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map(({ question, answer }) => (
              <article key={question} className="surface-card">
                <h3 className="card-title">{question}</h3>
                <p className="card-copy mt-3">{answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-grid">
          <article className="surface-card surface-card-large" id="lead-form">
            <div className="section-heading">
              <p className="section-kicker">Что дальше</p>
              <h2 className="section-title">Обсуждаем объём, категории и формат входа</h2>
            </div>
            <p className="text-base leading-7 text-[var(--color-muted)]">
              Это pre-sale страница. Здесь мы не принимаем оплату и не фиксируем публичный прайс.
              На старте важнее собрать запрос, понять объём и предложить реалистичный формат
              подключения для кофейни в Казани.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {primaryCtas.map((label, index) => (
                <a
                  key={label}
                  href="#lead-form"
                  className={index === 0 ? "cta-primary" : "cta-secondary"}
                >
                  {label}
                  <ArrowRight size={16} />
                </a>
              ))}
            </div>
          </article>

          <article className="surface-card surface-card-large bg-[var(--color-card-alt)]">
            <div className="section-heading">
              <p className="section-kicker">Что дальше для экосистемы</p>
              <h2 className="section-title">Supply Club — только первый слой</h2>
            </div>
            <p className="text-base leading-7 text-[var(--color-muted)]">
              Supply Club — первый слой будущей системы для кофеен. Позже мы развиваем инструменты
              для стандартов, рецептов, чек-листов, смен и выплат.
            </p>
          </article>
        </section>

        <section className="section-block pt-2">
          <div className="footer-banner">
            <div className="space-y-3">
              <p className="section-kicker">Финальный CTA</p>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Обсудить условия для моей кофейни
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
                Казань запускается как отдельный цикл. Условия зависят от объёма, категорий и
                маршрута поставки, поэтому начинаем с короткого разговора, а не с обещаний в лоб.
              </p>
            </div>
            <a href="#lead-form" className="cta-light">
              Обсудить условия для моей кофейни
              <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
