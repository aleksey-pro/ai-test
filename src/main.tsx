import { type FormEvent, type MouseEvent, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Highcharts from 'highcharts/highstock';
import './styles.css';

type Route =
  | '/'
  | '/contacts'
  | '/news/page/1'
  | '/news/page/2'
  | '/news/SD301225'
  | '/news/SILA051125';

type NewsItem = {
  slug: Route;
  date: string;
  title: string;
  text: string;
};

const primaryNews: NewsItem = {
  slug: '/news/SD301225',
  date: '23.12.2025 17:10',
  title:
    'Информация для владельцев инвестиционных паев Открытого паевого инвестиционного фонда рыночных финансовых инструментов «Сила Дохода».',
  text: 'Управляющая компания сообщает о предстоящей, ежеквартальной выплате дохода владельцам инвестиционных паев Открытого паевого инвестиционного фонда рыночных финансовых инструментов «Сила Дохода».',
};

const otherNews: NewsItem = {
  slug: '/news/SILA051125',
  date: '05.11.2025 17:42',
  title: 'Контрада Капитал запустила биржевой ПИФ «Сила Ликвидности»',
  text: 'Управляющая компания «Контрада Капитал» запустила свой первый биржевой ПИФ рыночных финансовых инструментов «Сила Ликвидности» (SILA) (далее – Фонд) и объявляет о старте торгов. Стратегия Фонда ориентирована на инструменты денежного рынка.',
};

const newsItems: NewsItem[] = [
  primaryNews,
  {
    slug: '/news/SILA051125',
    date: '05.11.2025 17:42',
    title: 'Старт торгов фондом «Сила Ликвидности»',
    text: otherNews.text,
  },
  {
    slug: '/news/SILA051125',
    date: '14.10.2025 11:20',
    title: 'Обновление стратегии управления портфелем',
    text: 'Команда управления раскрыла подход к диверсификации инструментов денежного рынка и плановую структуру портфеля.',
  },
];

const navigation: Array<{ label: string; path: Route }> = [
  { label: 'Главная', path: '/' },
  { label: 'Новости', path: '/news/page/1' },
  { label: 'Связаться', path: '/contacts' },
];

function currentRoute(): Route {
  const path = window.location.pathname;

  if (
    path === '/contacts' ||
    path === '/news/page/1' ||
    path === '/news/page/2' ||
    path === '/news/SD301225' ||
    path === '/news/SILA051125'
  ) {
    return path;
  }

  return '/';
}

function App() {
  const [route, setRoute] = useState<Route>(currentRoute);

  useEffect(() => {
    const updateRoute = () => setRoute(currentRoute());
    window.addEventListener('popstate', updateRoute);
    return () => window.removeEventListener('popstate', updateRoute);
  }, []);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, nextRoute: Route) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    window.history.pushState({}, '', nextRoute);
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <Header route={route} onNavigate={navigate} />
      <main>
        {route === '/' && <HomePage onNavigate={navigate} />}
        {route === '/contacts' && <ContactsPage />}
        {(route === '/news/page/1' || route === '/news/page/2') && (
          <NewsListPage pageNumber={route === '/news/page/2' ? 2 : 1} onNavigate={navigate} />
        )}
        {(route === '/news/SD301225' || route === '/news/SILA051125') && (
          <NewsDetailPage
            news={route === '/news/SD301225' ? primaryNews : otherNews}
            onNavigate={navigate}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

type NavigateHandler = (event: MouseEvent<HTMLAnchorElement>, route: Route) => void;

type HeaderProps = {
  route: Route;
  onNavigate: NavigateHandler;
};

function Header({ route, onNavigate }: HeaderProps) {
  const activeRoute = route.startsWith('/news') ? '/news/page/1' : route;

  return (
    <header className="header">
      <nav className="nav container" aria-label="Основная навигация">
        <a className="brand" href="/" onClick={(event) => onNavigate(event, '/')}>
          <span className="brand-mark" />
          Контрада Капитал
        </a>
        <div className="nav-links">
          {navigation.map((item) => (
            <a
              className={activeRoute === item.path ? 'nav-link active' : 'nav-link'}
              href={item.path}
              key={item.path}
              aria-current={activeRoute === item.path ? 'page' : undefined}
              onClick={(event) => onNavigate(event, item.path)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

function HomePage({ onNavigate }: { onNavigate: NavigateHandler }) {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">Управляющая компания</p>
          <h1>РОКОКО.</h1>
          <p className="banner-text">
            Надежный партнёр для доступных инвестиций. 21 год на рынке коллективных
            инвестиций &gt;70 млрд. ₽ в активном управлении &gt;50 реализованных
            через ЗПИФ проектов
          </p>
          <a className="button" href="/contacts" onClick={(event) => onNavigate(event, '/contacts')}>
            Начать разговор
          </a>
        </div>
        <div className="hero-stats" aria-label="Показатели компании">
          <div>
            <span>21 год</span>
            <p>на рынке коллективных инвестиций</p>
          </div>
          <div>
            <span>&gt;70 млрд. ₽</span>
            <p>в активном управлении</p>
          </div>
          <div>
            <span>&gt;50</span>
            <p>реализованных через ЗПИФ проектов</p>
          </div>
        </div>
      </section>

      <FundChartSection />
      <NewsSection onNavigate={onNavigate} />
      <RequisitesSection />
    </>
  );
}

const dayMs = 24 * 60 * 60 * 1000;

function utcDate(year: number, month: number, date: number) {
  return Date.UTC(year, month - 1, date);
}

function makeSeries(seed: number, scale: number) {
  const data: Array<[number, number]> = [];
  const start = utcDate(2023, 1, 2);

  for (let index = 0; index < 760; index += 1) {
    const time = start + index * dayMs;
    const seasonal = Math.sin((index + seed) / 34) * scale;
    const trend = index * (scale / 180);
    const step = Math.cos((index + seed) / 11) * (scale / 4);
    data.push([time, Math.round((100 + seasonal + trend + step) * 100) / 100]);
  }

  return data;
}

const chartSeriesData = {
  unitPrice: makeSeries(5, 9),
  nav: makeSeries(28, 18).map(([time, value]) => [time, Math.round(value * 1_000_000)]),
  benchmark: makeSeries(52, 7),
};

const chartDataMin = chartSeriesData.unitPrice[0][0];
const chartDataMax = chartSeriesData.unitPrice[chartSeriesData.unitPrice.length - 1][0];

function toInputDate(value: number) {
  return new Date(value).toISOString().slice(0, 10);
}

function fromInputDate(value: string) {
  return new Date(`${value}T00:00:00Z`).getTime();
}

function nextBusinessDay(value: number) {
  const weekDay = new Date(value).getUTCDay();
  if (weekDay === 6) return value + 2 * dayMs;
  if (weekDay === 0) return value + dayMs;
  return value;
}

function formatRuDate(value: number) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(value));
}

function FundChartSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);
  const [fundType, setFundType] = useState<'withPayout' | 'withoutPayout' | 'benchmark'>(
    'withPayout',
  );
  const [tab, setTab] = useState<'unitPrice' | 'nav'>('unitPrice');
  const [from, setFrom] = useState(chartDataMax - 180 * dayMs);
  const [to, setTo] = useState(chartDataMax);
  const [fromInput, setFromInput] = useState(toInputDate(chartDataMax - 180 * dayMs));
  const [toInput, setToInput] = useState(toInputDate(chartDataMax));
  const [showYield, setShowYield] = useState(false);
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [tableMode, setTableMode] = useState(false);
  const [status, setStatus] = useState('');

  const baseData = tab === 'nav' ? chartSeriesData.nav : chartSeriesData.unitPrice;

  const buildSeries = (): Highcharts.SeriesOptionsType[] => {
    const series: Highcharts.SeriesOptionsType[] = [
      {
        type: 'line',
        id: 'base',
        name: tab === 'nav' ? 'СЧА' : 'Стоимость пая',
        data: baseData,
        tooltip: { valueDecimals: tab === 'nav' ? 0 : 2 },
      },
    ];

    if (showYield && fundType !== 'benchmark') {
      const firstValue = baseData.find(([time]) => time >= from)?.[1] ?? baseData[0][1];
      series.push({
        type: 'line',
        id: 'yield',
        name: 'Динамика доходности фонда, %',
        yAxis: 1,
        data: baseData.map(([time, value]) => [
          time,
          Math.round(((value - firstValue) / firstValue) * 10_000) / 100,
        ]),
        tooltip: { valueSuffix: '%', valueDecimals: 2 },
      });
    }

    if (showBenchmark || fundType === 'benchmark') {
      series.push({
        type: 'line',
        id: 'benchmark',
        name: 'Бенчмарк',
        data: chartSeriesData.benchmark,
        dashStyle: 'ShortDash',
        tooltip: { valueDecimals: 2 },
      });
    }

    return series;
  };

  useEffect(() => {
    if (!containerRef.current) return undefined;

    chartRef.current?.destroy();
    chartRef.current = Highcharts.stockChart(containerRef.current, {
      accessibility: { enabled: false },
      chart: { spacingTop: 16 },
      credits: { enabled: false },
      legend: { enabled: true },
      navigator: { enabled: true },
      plotOptions: {
        series: {
          animation: false,
        },
      },
      rangeSelector: { enabled: false },
      scrollbar: { enabled: true },
      title: { text: '' },
      tooltip: { split: true },
      xAxis: {
        events: {
          setExtremes(event: { min?: number; max?: number }) {
            if (!event.min || !event.max) return;
            setFrom(Math.round(event.min));
            setTo(Math.round(event.max));
            setFromInput(toInputDate(event.min));
            setToInput(toInputDate(event.max));
          },
        },
      },
      yAxis: [
        { title: { text: 'Значение' }, opposite: false },
        { title: { text: 'Доходность, %' }, opposite: true },
      ],
      series: buildSeries(),
    });

    chartRef.current.xAxis[0].setExtremes(from, to, true, false);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    while (chartRef.current.series.length > 0) {
      chartRef.current.series[0].remove(false);
    }

    buildSeries().forEach((series) => chartRef.current?.addSeries(series, false));
    chartRef.current.redraw();
    chartRef.current.xAxis[0].setExtremes(from, to, true, false);
  }, [fundType, tab, showYield, showBenchmark]);

  const setRange = (nextFrom: number, nextTo: number) => {
    let normalizedFrom = nextBusinessDay(nextFrom);
    let normalizedTo = nextBusinessDay(nextTo);

    if (normalizedFrom > normalizedTo) {
      setStatus('Начальная дата больше конечной.');
      return;
    }

    if (normalizedFrom < chartDataMin || normalizedTo > chartDataMax) {
      setStatus('Введена некорректная дата.');
      normalizedFrom = Math.max(normalizedFrom, chartDataMin);
      normalizedTo = Math.min(normalizedTo, chartDataMax);
    } else {
      setStatus('');
    }

    setFrom(normalizedFrom);
    setTo(normalizedTo);
    setFromInput(toInputDate(normalizedFrom));
    setToInput(toInputDate(normalizedTo));
    chartRef.current?.xAxis[0].setExtremes(normalizedFrom, normalizedTo, true, false);
  };

  const applyRangePreset = (range: '1m' | '3m' | 'ytd' | 'all') => {
    const fromByRange = {
      '1m': chartDataMax - 30 * dayMs,
      '3m': chartDataMax - 90 * dayMs,
      ytd: Date.UTC(new Date(chartDataMax).getUTCFullYear(), 0, 1),
      all: chartDataMin,
    };

    setRange(fromByRange[range], chartDataMax);
  };

  const tableRows = baseData
    .filter(([time]) => time >= from && time <= to)
    .filter((_, index) => index % 20 === 0)
    .slice(0, 16);

  return (
    <section className="content-section container fund-chart-section" aria-labelledby="fund-chart-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Highcharts Stock</p>
          <h2 id="fund-chart-title">График стоимости пая и СЧА</h2>
        </div>
      </div>

      <div className="chart-toolbar" aria-label="Настройки графика">
        <label>
          Тип графика
          <select value={fundType} onChange={(event) => setFundType(event.target.value as typeof fundType)}>
            <option value="withPayout">С выплатой</option>
            <option value="withoutPayout">Без выплаты</option>
            <option value="benchmark">Бенчмарк</option>
          </select>
        </label>
        <label>
          Вкладка
          <select value={tab} onChange={(event) => setTab(event.target.value as typeof tab)}>
            <option value="unitPrice">Стоимость пая</option>
            <option value="nav">График СЧА</option>
          </select>
        </label>
        <label>
          Начальная дата
          <input type="date" value={fromInput} onChange={(event) => setFromInput(event.target.value)} />
        </label>
        <label>
          Конечная дата
          <input type="date" value={toInput} onChange={(event) => setToInput(event.target.value)} />
        </label>
      </div>

      <div className="chart-actions">
        <button type="button" onClick={() => applyRangePreset('1m')}>
          1 мес
        </button>
        <button type="button" onClick={() => applyRangePreset('3m')}>
          3 мес
        </button>
        <button type="button" onClick={() => applyRangePreset('ytd')}>
          С начала года
        </button>
        <button type="button" onClick={() => applyRangePreset('all')}>
          За весь период
        </button>
        <button type="button" onClick={() => setRange(fromInputDate(fromInput), fromInputDate(toInput))}>
          Применить даты
        </button>
      </div>

      <div className="chart-toggles">
        <label>
          <input
            type="checkbox"
            checked={showYield}
            onChange={(event) => setShowYield(event.target.checked)}
          />
          Отображать динамику доходности фонда
        </label>
        <label>
          <input
            type="checkbox"
            checked={showBenchmark || fundType === 'benchmark'}
            onChange={(event) => setShowBenchmark(event.target.checked)}
          />
          Сравнить с бенчмарком
        </label>
        <label>
          <input
            type="checkbox"
            checked={tableMode}
            onChange={(event) => setTableMode(event.target.checked)}
          />
          Режим Таблица
        </label>
      </div>

      <div className="stock-chart" ref={containerRef} />
      <p className="chart-status" role="status">
        {status}
      </p>

      {tableMode && (
        <div className="chart-table">
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>{tab === 'nav' ? 'СЧА' : 'Стоимость пая'}</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(([time, value]) => (
                <tr key={time}>
                  <td>{formatRuDate(time)}</td>
                  <td>{value.toLocaleString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function NewsSection({ onNavigate }: { onNavigate: NavigateHandler }) {
  return (
    <section className="content-section container" aria-labelledby="home-news-title">
      <div className="section-heading">
        <h2 id="home-news-title">Новости</h2>
        <a
          className="inline-link"
          href="/news/page/1"
          onClick={(event) => onNavigate(event, '/news/page/1')}
        >
          Все новости
        </a>
      </div>
      <div className="news-grid">
        {newsItems.map((item) => (
          <NewsCard key={`${item.slug}-${item.date}`} item={item} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  );
}

function NewsCard({ item, onNavigate }: { item: NewsItem; onNavigate: NavigateHandler }) {
  return (
    <a className="news-card" href={item.slug} onClick={(event) => onNavigate(event, item.slug)}>
      <time dateTime={item.date}>{item.date}</time>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
      <span>Читать</span>
    </a>
  );
}

function NewsListPage({
  pageNumber,
  onNavigate,
}: {
  pageNumber: 1 | 2;
  onNavigate: NavigateHandler;
}) {
  const pageItems =
    pageNumber === 1
      ? newsItems
      : [
          {
            slug: '/news/SILA051125' as Route,
            date: '01.09.2025 10:05',
            title: 'Раскрытие информации о составе активов',
            text: 'Компания опубликовала актуальные сведения о составе и структуре активов фонда.',
          },
          {
            slug: '/news/SILA051125' as Route,
            date: '18.08.2025 16:30',
            title: 'Изменение графика обслуживания клиентов',
            text: 'Обновлен график работы клиентской поддержки и обработки обращений инвесторов.',
          },
        ];

  return (
    <section className="page-section container" aria-labelledby="news-list-title">
      <TitleWithBack
        title="Новости"
        href="/"
        onNavigate={(event) => onNavigate(event, '/')}
        id="news-list-title"
      />
      <div className="news-list">
        {pageItems.map((item) => (
          <NewsCard key={`${pageNumber}-${item.date}`} item={item} onNavigate={onNavigate} />
        ))}
      </div>
      <Pagination pageNumber={pageNumber} onNavigate={onNavigate} />
      <SubscribeBlock variant="modal" />
    </section>
  );
}

function Pagination({
  pageNumber,
  onNavigate,
}: {
  pageNumber: 1 | 2;
  onNavigate: NavigateHandler;
}) {
  return (
    <nav className="pagination" aria-label="Пагинация новостей">
      <a
        aria-label="Стрелка влево"
        className={pageNumber === 1 ? 'page-button disabled' : 'page-button'}
        href="/news/page/1"
        onClick={(event) => onNavigate(event, '/news/page/1')}
      >
        ←
      </a>
      <a
        className={pageNumber === 1 ? 'page-button active' : 'page-button'}
        href="/news/page/1"
        onClick={(event) => onNavigate(event, '/news/page/1')}
      >
        1
      </a>
      <a
        className={pageNumber === 2 ? 'page-button active' : 'page-button'}
        href="/news/page/2"
        onClick={(event) => onNavigate(event, '/news/page/2')}
      >
        2
      </a>
      <a
        aria-label="Стрелка вправо"
        className={pageNumber === 2 ? 'page-button disabled' : 'page-button'}
        href="/news/page/2"
        onClick={(event) => onNavigate(event, '/news/page/2')}
      >
        →
      </a>
    </nav>
  );
}

function NewsDetailPage({ news, onNavigate }: { news: NewsItem; onNavigate: NavigateHandler }) {
  return (
    <article className="page-section container news-detail">
      <TitleWithBack
        title="Новости"
        href="/news/page/1"
        onNavigate={(event) => onNavigate(event, '/news/page/1')}
        id="news-detail-title"
      />
      <time dateTime={news.date}>{news.date}</time>
      <h2>{news.title}</h2>
      <p>{news.text}</p>
      <SubscribeBlock variant="inline" />
      <OtherNews onNavigate={onNavigate} />
    </article>
  );
}

function TitleWithBack({
  title,
  href,
  id,
  onNavigate,
}: {
  title: string;
  href: Route;
  id: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <div className="title-row">
      <a className="back-link" aria-label="Стрелка назад" href={href} onClick={onNavigate}>
        ←
      </a>
      <h1 id={id}>{title}</h1>
    </div>
  );
}

function OtherNews({ onNavigate }: { onNavigate: NavigateHandler }) {
  const items = [
    otherNews,
    {
      slug: '/news/SILA051125' as Route,
      date: '20.10.2025 12:15',
      title: 'Еженедельный обзор денежного рынка',
      text: 'Аналитики компании подготовили обзор динамики ставок и инструментов краткосрочного размещения средств.',
    },
    {
      slug: '/news/SILA051125' as Route,
      date: '02.10.2025 09:45',
      title: 'Информация для квалифицированных инвесторов',
      text: 'Опубликованы материалы о правилах доступа к продуктам для квалифицированных инвесторов.',
    },
  ];

  return (
    <section className="content-section other-news" aria-labelledby="other-news-title">
      <div className="section-heading">
        <h2 id="other-news-title">Другие новости</h2>
      </div>
      <div className="news-grid">
        {items.map((item) => (
          <NewsCard key={`other-${item.date}`} item={item} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  );
}

function SubscribeBlock({ variant }: { variant: 'modal' | 'inline' }) {
  const [isOpen, setIsOpen] = useState(variant === 'inline');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="subscribe" aria-labelledby={`${variant}-subscribe-title`}>
      <div className="subscribe-heading">
        <h2 id={`${variant}-subscribe-title`}>Подписаться на новости</h2>
        {variant === 'modal' && (
          <button className="button" type="button" onClick={() => setIsOpen(true)}>
            Подписаться на новости
          </button>
        )}
      </div>
      {isOpen && (
        <form className="subscribe-form" onSubmit={submit}>
          <label>
            Ваше имя
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            Я даю согласие на обработку персональных данных
          </label>
          <button className="button" type="submit">
            Подписаться
          </button>
        </form>
      )}
      {submitted && (
        <div className="submit-result" role="status">
          Данные пользователя Имя: {name} Фамилия: Email: {email} Телефон: Дата:
          2026-03-27 09:46:22 Комментарий:
        </div>
      )}
    </section>
  );
}

function RequisitesSection() {
  return (
    <section className="content-section container requisites" aria-labelledby="requisites-title">
      <div className="section-heading">
        <h2 id="requisites-title">Реквизиты</h2>
      </div>
      <dl>
        <div>
          <dt>Полное наименование на русском языке</dt>
          <dd>Акционерное общество «Контрада Капитал»</dd>
        </div>
        <div>
          <dt>Адрес</dt>
          <dd>Москва, Набережная света, 24</dd>
        </div>
      </dl>
    </section>
  );
}

function ContactsPage() {
  return (
    <section className="contacts container">
      <div className="contacts-intro">
        <p className="eyebrow">Свяжитесь с нами</p>
        <h1>Обсудим вашу следующую историю.</h1>
        <p className="lead">
          Расскажите о задаче, сроках и смелой идее. Мы ответим в течение одного
          рабочего дня.
        </p>
      </div>
      <div className="contact-panel">
        <h2>Контакты</h2>
        <a href="mailto:hello@contrada.example">hello@contrada.example</a>
        <a href="tel:+74951234567">+7 (495) 123-45-67</a>
        <p>Москва, Набережная света, 24</p>
        <div className="schedule">
          <span>Пн - Пт</span>
          <strong>10:00 - 19:00</strong>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer container">
      <p>Контрада Капитал</p>
      <p>2026 / Москва</p>
    </footer>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
