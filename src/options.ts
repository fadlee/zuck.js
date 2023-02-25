import { notUndefined, safeNum, timeAgo } from './utils';
import { Options, StoryItem, TimelineItem, Zuck } from './types';

export const optionsDefault = (option?: Zuck['option']) => ({
  rtl: false,
  skin: 'snapgram',
  avatars: true,
  stories: [],
  backButton: true,
  backNative: false,
  paginationArrows: false,
  previousTap: true,
  autoFullScreen: false,
  openEffect: true,
  cubeEffect: false,
  list: false,
  localStorage: true,
  callbacks: {
    onOpen: function (storyId, callback) {
      callback();
    },
    onView: function (storyId, callback) {
      callback?.();
    },
    onEnd: function (storyId, callback) {
      callback();
    },
    onClose: function (storyId, callback) {
      callback();
    },
    onNextItem: function (storyId, nextStoryId, callback) {
      callback();
    },
    onNavigateItem: function (storyId, nextStoryId, callback) {
      callback();
    }
  },
  template: {
    timelineItem(itemData: TimelineItem) {
      return `
        <div class="story ${itemData['seen'] === true ? 'seen' : ''}">
          <a class="item-link" ${
            itemData['link'] ? `href="${itemData['link'] || ''}"` : ''
          }>
            <span class="item-preview">
              <img lazy="eager" src="${
                option('avatars') || !itemData['currentPreview']
                  ? itemData['photo']
                  : itemData['currentPreview']
              }" />
            </span>
            <span class="info" itemProp="author" itemScope itemType="http://schema.org/Person">
              <strong class="name" itemProp="name">${itemData['name']}</strong>
              <span class="time">${
                timeAgo(itemData['lastUpdated'], option('language')) || ''
              }</span>
            </span>
          </a>

          <ul class="items"></ul>
        </div>`;
    },

    timelineStoryItem(itemData: StoryItem) {
      const reserved = [
        'id',
        'seen',
        'src',
        'link',
        'linkText',
        'loop',
        'time',
        'type',
        'length',
        'preview'
      ];

      let attributes = ``;

      for (const dataKey in itemData) {
        if (reserved.indexOf(dataKey) === -1) {
          attributes += ` data-${dataKey}="${itemData[dataKey]}"`;
        }
      }

      reserved.forEach((dataKey) => {
        attributes += ` data-${dataKey}="${itemData[dataKey]}"`;
      });

      return `<a href="${itemData['src']}" ${attributes}>
                <img loading="auto" src="${itemData['preview']}" />
              </a>`;
    },

    viewerItem(storyData: StoryItem, currentStoryItem: StoryItem) {
      return `<div class="story-viewer">
                <div class="head">
                  <div class="left">
                    ${
                      option('backButton') ? '<a class="back">&lsaquo;</a>' : ''
                    }

                    <span class="item-preview">
                      <img lazy="eager" class="profilePhoto" src="${
                        storyData['photo']
                      }" />
                    </span>

                    <div class="info">
                      <strong class="name">${storyData['name']}</strong>
                      <span class="time">${
                        timeAgo(storyData['time'], option('language')) || ''
                      }</span>
                    </div>
                  </div>

                  <div class="right">
                    <span class="time">${
                      timeAgo(currentStoryItem['time'], option('language')) ||
                      ''
                    }</span>
                    <span class="loading"></span>
                    <a class="close" tabIndex="2">&times;</a>
                  </div>
                </div>

                <div class="slides-pointers">
                  <div class="wrap"></div>
                </div>

                ${
                  option('paginationArrows')
                    ? `<div class="slides-pagination">
                      <span class="previous">&lsaquo;</span>
                      <span class="next">&rsaquo;</span>
                    </div>`
                    : ''
                }
              </div>`;
    },

    viewerItemPointer(index: number, currentIndex: number, item: StoryItem) {
      return `<span
                class="${currentIndex === index ? 'active' : ''} ${
        item['seen'] === true ? 'seen' : ''
      }"
                data-index="${index}" data-item-id="${item['id']}">
                  <b style="animation-duration:${
                    safeNum(item['length']) ? item['length'] : '3'
                  }s"></b>
              </span>`;
    },

    viewerItemBody(index: number, currentIndex: number, item: StoryItem) {
      return `<div
                class="item ${item['seen'] === true ? 'seen' : ''} ${
        currentIndex === index ? 'active' : ''
      }"
                data-time="${item['time']}" data-type="${
        item['type']
      }" data-index="${index}" data-item-id="${item['id']}">
                ${
                  item['type'] === 'video'
                    ? `<video class="media" data-length="${item.length}" ${
                        item.loop ? 'loop' : ''
                      } muted webkit-playsinline playsinline preload="auto" src="${
                        item['src']
                      }" ${item['type']}></video>
                    <b class="tip muted">${option('language', 'unmute')}</b>`
                    : `<img loading="auto" class="media" src="${item['src']}" ${item['type']} />
                `
                }

                ${
                  item['link']
                    ? `<a class="tip link" href="${
                        item['link']
                      }" rel="noopener" target="_blank">
                        ${
                          !item['linkText'] || item['linkText'] === ''
                            ? option('language', 'visitLink')
                            : item['linkText']
                        }
                      </a>`
                    : ''
                }
              </div>`;
    }
  },
  language: {
    unmute: 'Touch to unmute',
    keyboardTip: 'Press space to see next',
    visitLink: 'Visit link',
    time: {
      ago: 'ago',
      hour: 'hour ago',
      hours: 'hours ago',
      minute: 'minute ago',
      minutes: 'minutes ago',
      fromnow: 'from now',
      seconds: 'seconds ago',
      yesterday: 'yesterday',
      tomorrow: 'tomorrow',
      days: 'days ago'
    }
  }
});

export const option = function (
  options?: Options,
  _name?: string,
  _prop?: string
) {
  const self = (name?: string, prop?: string) => {
    if (prop) {
      if (notUndefined(options?.[name])) {
        return notUndefined(options?.[name]?.[prop])
          ? options?.[name]?.[prop]
          : optionsDefault(self)[name]?.[prop];
      } else {
        return optionsDefault(self)[name]?.[prop];
      }
    } else {
      return notUndefined(options?.[name])
        ? options?.[name]
        : optionsDefault(self)[name];
    }
  };

  return self(_name, _prop);
};

export const loadOptions = function (opts?: Options) {
  return {
    option: (name: string, prop?: string) => {
      return option(opts, name, prop);
    }
  };
};