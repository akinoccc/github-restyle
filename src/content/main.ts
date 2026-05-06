import { getSettings, onSettingsChanged, type StorageSchema } from '../shared/storage';
import { getThemeById, getThemeClassNames } from '../shared/themes';
import './styles/base.css';
import './styles/vivid-light/index.css';

const ROOT_FLAG = 'data-github-restyle-theme';
const ENABLED_FLAG = 'data-github-restyle-enabled';
const ENHANCED_FLAG = 'data-github-restyle-enhanced';

const PAGE_CLASSES = {
  search: 'github-restyle-page-search',
  issues: 'github-restyle-page-issues',
  issueDetail: 'github-restyle-page-issue-detail',
  pulls: 'github-restyle-page-pulls',
  discussionDetail: 'github-restyle-page-discussion-detail',
  profile: 'github-restyle-page-profile',
  organization: 'github-restyle-page-organization',
};

interface MarkerRule {
  selector: string;
  classNames: string[];
  firstOnly?: boolean;
}

let currentSettings: StorageSchema | null = null;
let enhanceFrame = 0;

const MARKER_RULES: MarkerRule[] = [
  {
    selector: '.AppHeader, .Header, .HeaderMktg, header[role="banner"]',
    classNames: ['github-restyle-app-header'],
    firstOnly: true,
  },
  {
    selector: '[data-testid="repository-container-header"]',
    classNames: ['github-restyle-repo-header', 'github-restyle-section-header'],
    firstOnly: true,
  },
  {
    selector: '[data-testid="repository-container-header"], .repository-content, .application-main',
    classNames: ['github-restyle-repo-area'],
    firstOnly: true,
  },
  {
    selector: '.UnderlineNav, .tabnav',
    classNames: ['github-restyle-nav-tabs'],
  },
  {
    selector: '.UnderlineNav-item, .tabnav-tab',
    classNames: ['github-restyle-nav-tab'],
  },
  {
    selector: '.UnderlineNav-item.selected, .tabnav-tab.selected, .js-selected-navigation-item.selected',
    classNames: ['github-restyle-nav-tab-selected'],
  },
  {
    selector: '.Layout-sidebar, .js-profile-editable-area',
    classNames: ['github-restyle-sidebar'],
  },
  {
    selector:
      '.Box:not(.dropdown-menu):not(.Popover-message):not(.SelectMenu-modal):not(.Overlay):not(.flash), .TimelineItem-body, .file, .js-file, .react-code-view, .blob-wrapper, table.highlight, .pinned-item-list-item',
    classNames: ['github-restyle-panel'],
  },
  {
    selector: '.Box-header, .TimelineItem-body > .TimelineItem-header, .file-header',
    classNames: ['github-restyle-panel-header'],
  },
  {
    selector: '.pinned-item-list-item',
    classNames: ['github-restyle-pinned-card'],
  },
  {
    selector: '.TimelineItem, .TimelineItem-body',
    classNames: ['github-restyle-timeline-item'],
  },
  {
    selector: '.application-main:has(.js-yearly-contributions) .TimelineItem-body, .application-main:has(.orghead) .TimelineItem-body',
    classNames: ['github-restyle-profile-timeline-card'],
  },
  {
    selector: '.js-yearly-contributions .graph-before-activity-overview, .js-yearly-contributions .activity-overview-box, .js-profile-timeline-year-list',
    classNames: ['github-restyle-profile-activity-card'],
  },
  {
    selector: '.js-yearly-contributions .activity-overview-box',
    classNames: ['github-restyle-profile-activity-overview'],
  },
  {
    selector: '.ContributionCalendar',
    classNames: ['github-restyle-contribution-calendar'],
  },
  {
    selector: '.ContributionCalendar-day',
    classNames: ['github-restyle-contribution-day'],
  },
  {
    selector: '.js-profile-timeline-year-list',
    classNames: ['github-restyle-profile-year-list'],
  },
  {
    selector: '.js-profile-timeline-year-list a',
    classNames: ['github-restyle-profile-year-link'],
  },
  {
    selector: '.application-main:has(.orghead) .github-restyle-panel, .application-main:has(.orghead) .pinned-item-list-item',
    classNames: ['github-restyle-org-card'],
  },
  {
    selector: '.application-main:has(.orghead) .color-bg-default.ml-1.mr-2',
    classNames: ['github-restyle-org-avatar-chip'],
  },
  {
    selector:
      '.Box-row, .js-issue-row, .react-directory-row, .js-navigation-container > li, [data-testid="issue-row"], [data-testid="workflow-run-row"]',
    classNames: ['github-restyle-list-row'],
  },
  {
    selector: '.react-directory-row, table[aria-label="Folders and files"] tr',
    classNames: ['github-restyle-directory-row'],
  },
  {
    selector: '.react-directory-filename-column, table[aria-label="Folders and files"] td:first-child',
    classNames: ['github-restyle-directory-primary-cell'],
  },
  {
    selector: 'table[aria-label="Folders and files"] td, table[aria-label="Folders and files"] th',
    classNames: ['github-restyle-directory-cell'],
  },
  {
    selector: '.BorderGrid-row',
    classNames: ['github-restyle-border-grid-row'],
  },
  {
    selector: '.ActionList',
    classNames: ['github-restyle-action-list'],
  },
  {
    selector: '.ActionListItem',
    classNames: ['github-restyle-action-list-item'],
  },
  {
    selector: '.btn, .Button:not(.Button--link), button:not(:has(input)):not([role="tab"]), summary.btn, summary.Button:not(.Button--link), a[role="button"]',
    classNames: ['github-restyle-button'],
  },
  {
    selector: 'main button[aria-label*="Watch"], main button[aria-label*="watch"], main button[aria-label*="Unwatch"], main button[aria-label*="unwatch"], main button[aria-label*="notifications"], main button[aria-label*="Notifications"], main button:has(svg.octicon-eye), main button:has([class*="octicon-eye"])',
    classNames: ['github-restyle-button', 'github-restyle-repo-action-button'],
  },
  {
    selector: '.github-restyle-app-header .github-restyle-button',
    classNames: ['github-restyle-header-button'],
  },
  {
    selector: '.btn-primary, .Button--primary',
    classNames: ['github-restyle-button-primary'],
  },
  {
    selector: 'main a[href$="/new"], main a[href$="/new"][role="button"], main a[href$="/new_repository"], main a[href$="/repositories/new"], main a[href*="/new?"][role="button"], main button[data-variant="primary"], main button[class*="primary"], main a[data-variant="primary"], main a[class*="primary"][role="button"], main a[aria-label*="New repository"], main a[aria-label*="new repository"], main button[aria-label*="New repository"], main button[aria-label*="new repository"]',
    classNames: ['github-restyle-button', 'github-restyle-button-primary'],
  },
  {
    selector: '.btn-danger, .Button--danger',
    classNames: ['github-restyle-button-danger'],
  },
  {
    selector: 'main button:has(input[placeholder="Go to file"]), main button:has(input[aria-label="Go to file"]), main button:has(input[aria-label="Find a file"])',
    classNames: ['github-restyle-go-file-button'],
  },
  {
    selector: '.github-restyle-go-file-button kbd, .github-restyle-go-file-button [data-component="KeyboardKey"]',
    classNames: ['github-restyle-keycap'],
  },
  {
    selector: 'main button:has([data-target*="query-builder"]), main button:has([data-component*="QueryBuilder"]), main button:has([data-component*="SearchInput"])',
    classNames: ['github-restyle-compact-search-button'],
  },
  {
    selector: '.Label, .IssueLabel, .State, .Counter',
    classNames: ['github-restyle-label'],
  },
  {
    selector: '.State',
    classNames: ['github-restyle-state-label'],
  },
  {
    selector: '.Counter, .Label--secondary',
    classNames: ['github-restyle-counter-label'],
  },
  {
    selector: '[role="dialog"], .Overlay, [data-target*="command-palette"], [data-target*="query-builder"]',
    classNames: ['github-restyle-dialog'],
  },
  {
    selector: '[role="dialog"]:has(input[type="search"], input[name="q"], [data-target*="query-builder"], [data-component*="Search"]), .Overlay:has(input[type="search"], input[name="q"], [data-target*="query-builder"], [data-component*="Search"])',
    classNames: ['github-restyle-search-dialog'],
  },
  {
    selector: '.github-restyle-dialog [role="option"], .github-restyle-dialog [role="listitem"], .github-restyle-dialog [class*="ActionListItem"]',
    classNames: ['github-restyle-dialog-item'],
  },
  {
    selector:
      '.github-restyle-page-issues main button[data-target*="query-builder"], .github-restyle-page-issues main button[data-component*="QueryBuilder"], .github-restyle-page-issues main button[data-component*="SearchInput"], .github-restyle-page-issues main button:has(.octicon-search, svg.octicon-search, [data-target*="query-builder"], [data-component*="QueryBuilder"], [data-component*="SearchInput"]), .github-restyle-page-pulls main button[data-target*="query-builder"], .github-restyle-page-pulls main button[data-component*="QueryBuilder"], .github-restyle-page-pulls main button[data-component*="SearchInput"], .github-restyle-page-pulls main button:has(.octicon-search, svg.octicon-search, [data-target*="query-builder"], [data-component*="QueryBuilder"], [data-component*="SearchInput"])',
    classNames: ['github-restyle-issue-search-button'],
  },
  {
    selector: '.github-restyle-page-search [data-testid="results-list"] > div, .github-restyle-page-search .border:not(.HeaderMenu-link), .github-restyle-page-search [data-testid="sponsor-card"]',
    classNames: ['github-restyle-search-result-card'],
  },
  {
    selector: '.github-restyle-page-search [data-testid="results-list"] button, .github-restyle-page-search [data-testid="results-list"] a[role="button"], .github-restyle-page-search a[class*="Pagination"], .github-restyle-page-search span[class*="Pagination"]',
    classNames: ['github-restyle-search-control'],
  },
  {
    selector: '.github-restyle-page-search [aria-current="page"], .github-restyle-page-search [class*="Pagination"][aria-current="page"]',
    classNames: ['github-restyle-search-control-current'],
  },
  {
    selector: '.github-restyle-page-search [class*="search-title"], .github-restyle-page-search h1, .github-restyle-page-search h2',
    classNames: ['github-restyle-search-title'],
  },
  {
    selector: '.github-restyle-page-search [class*="Topic"], .github-restyle-page-search .topic-tag',
    classNames: ['github-restyle-topic-label'],
  },
  {
    selector: '.github-restyle-page-discussion-detail main .gh-header, .github-restyle-page-discussion-detail main .gh-header-title, .github-restyle-page-discussion-detail main .gh-header-show',
    classNames: ['github-restyle-discussion-header'],
  },
];

function applySettings(settings: StorageSchema): void {
  currentSettings = settings;

  const theme = getThemeById(settings.selectedThemeId);
  const root = document.documentElement;

  root.dataset.githubRestyleTheme = settings.enabled ? theme.id : 'github-default';
  root.dataset.githubRestyleEnabled = String(settings.enabled);
  root.classList.remove(
    ...getThemeClassNames(),
    ...Object.values(PAGE_CLASSES),
  );

  if (settings.enabled) {
    root.classList.add(theme.className);
    root.setAttribute(ROOT_FLAG, theme.id);
    root.setAttribute(ENABLED_FLAG, 'true');
  } else {
    root.classList.add('github-restyle-theme-default');
    root.setAttribute(ROOT_FLAG, 'github-default');
    root.setAttribute(ENABLED_FLAG, 'false');
  }

  scheduleEnhancement();
}

function tagElement(element: Element, classNames: string[]): void {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  if (element.matches('input, textarea, select')) {
    return;
  }

  const missingClassNames = classNames.filter((className) => !element.classList.contains(className));

  if (missingClassNames.length > 0) {
    element.classList.add(...missingClassNames);
  }
}

function tagAll(rule: MarkerRule): void {
  const elements = rule.firstOnly
    ? [document.querySelector(rule.selector)].filter(Boolean)
    : Array.from(document.querySelectorAll(rule.selector));

  elements.forEach((element) => {
    if (element) {
      tagElement(element, rule.classNames);
    }
  });
}

function tagPageState(): void {
  const root = document.documentElement;

  root.classList.toggle(PAGE_CLASSES.search, location.pathname.startsWith('/search'));
  root.classList.toggle(PAGE_CLASSES.issues, /\/issues(?:\/|$)/.test(location.pathname));
  root.classList.toggle(PAGE_CLASSES.issueDetail, /\/issues\/\d+(?:\/|$)/.test(location.pathname));
  root.classList.toggle(PAGE_CLASSES.pulls, /\/pulls(?:\/|$)/.test(location.pathname));
  root.classList.toggle(
    PAGE_CLASSES.discussionDetail,
    /\/discussions\/\d+(?:\/|$)/.test(location.pathname),
  );
  root.classList.toggle(
    PAGE_CLASSES.profile,
    Boolean(document.querySelector('.application-main:has(.js-yearly-contributions)')),
  );
  root.classList.toggle(
    PAGE_CLASSES.organization,
    Boolean(document.querySelector('.application-main:has(.orghead)')),
  );
}

function enhanceGitHubSurface(): void {
  if (!currentSettings?.enabled) {
    return;
  }

  document.documentElement.setAttribute(ENHANCED_FLAG, 'true');
  tagPageState();
  MARKER_RULES.forEach(tagAll);
}

function scheduleEnhancement(): void {
  if (enhanceFrame) {
    window.cancelAnimationFrame(enhanceFrame);
  }

  enhanceFrame = window.requestAnimationFrame(() => {
    enhanceFrame = 0;
    enhanceGitHubSurface();
  });
}

function observePageChanges(): void {
  const observer = new MutationObserver(scheduleEnhancement);

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

async function bootstrap(): Promise<void> {
  applySettings(await getSettings());
  observePageChanges();
  onSettingsChanged(applySettings);
}

void bootstrap();
