"use strict";

var Affiliation = {
  debug: 0,

  // IMPORTANT: Keep the same order of affiliations here as in options.html

  // Explanation of organization attributes:

  // name: 'Organization X',
  // key: 'orgx',
  // web: 'https://orgx.com',
  // feed: 'https://orgx.com/feed',             // ALTERNATIVE: Use either 'feed' or 'getNews', not both
  // logo: './org/orgx/logo.png',               // 512x128 transparent white logo, for dark backgrounds
  // icon: './org/orgx/icon.png',               //  76x76  transparent icon, for extension icon
  // symbol: './org/orgx/symbol.png',           // 256x256 transparent symbol, big version of the icon with ~20% empty padding
  // placeholder: './org/orgx/placeholder.png', // 512x256 placeholder, used when news images is loading, standard was previously 512x384
  // sponsor: './org/orgx/sponsor.png',         // 512x128 sponsor logo, replaces the affiliation logo in the corner of the infoscreen
  // palette: 'orgx',                           // The color palette to use, if special palette exists use orgx-key
  // palettePath: './org/orgx/palette.css',     // OPTIONAL: Path to the special palette
  // useAltLink: true,                          // OPTIONAL: Search each news post for alternative link to use?
  // hw: {                                      // OPTIONAL: Has hardwarefeatures?
  //   office: "orgxkontoret",                  // OPTIONAL: Friendly name for the affiliation office
  //   apis: {
  //     coffee: 'http://orgx.no/coffee',       // Coffee data
  //     light: 'http://orgx.no/lys',           // Light data
  //     servant: 'http://orgx.no/servant',     // Todays servant list
  //     meetings: 'http://orgx.no/meetings',   // Todays meetings
  //   },
  //   statusIcons: {
  //     open: './org/orgx/icon.png',
  //     closed: './org/orgx/icon.png',
  //     meeting: './org/orgx/icon.png',
  //   },
  //   statusMessages: {                        // OPTIONAL: separate statusmessages for this affiliation's office
  //     open: 'Velkommen inn!',
  //     closed: 'Få tilgang av kontorsjef',
  //     meeting: 'Kontoret er helt opptatt!',
  //   },
  //   memePath: './org/orgx/meme/',            // OPTIONAL: pictures in /orgx/meme/ with the format 1...N.jpg
  // },
  // irc: {                                     // OPTIONAL: add IRC button to the popup
  //   server: 'irc.freenode.net',
  //   channel: '#orgx',
  // }
  // getImages: function(links, callback) {},   // OPTIONAL: fetch all news images with one scrape, prefer this to 'getImage'
  // getImage: function(link, callback) {},     // OPTIONAL: fetch news images for articles separately
  // getNews: function(limit, callback) {},     // OPTIONAL: getNews may override standard RSS/Atom fetching, use either 'feed' or 'getNews', not both

  // Other notes:
  // - Image dimensions should be in the power of two in case we decide to use WebGL one day.

  org: {

    // DEBUG (separate affiliation that fetches data from Notipis / Notiwire in DEBUG mode)

    'DEBUG': {
      name: 'DEBUG',
      key: 'DEBUG',
      web: 'http://example.com/',
      feed: 'http://dusken.no/feed/',
      logo: './org/DEBUG/logo.png',
      icon: './org/DEBUG/icon.png',
      symbol: './org/DEBUG/symbol.png',
      placeholder: './org/DEBUG/placeholder.png',
      palette: 'grey',
      hw: {
        office: 'DEBUG-kontoret',
        apis: {
          coffee: true,
          light: true,
          servant: 'informatikk.org_r25vb0o7ounepq40tc4pcieh84%40group.calendar.google.com',
          meetings: 'informatikk.org_r25vb0o7ounepq40tc4pcieh84%40group.calendar.google.com'
        },
        statusIcons: {
          open: './org/DEBUG/icon-open.png',
          closed: './org/DEBUG/icon-closed.png',
          meeting: './org/DEBUG/icon-meeting.png',
        },
      },
      getImage: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'div.col-xs-12', domainUrl:'dusken.no'});
      },
    },

    // Linjeforeninger Gløshaugen

    'abakus': {
      name: 'Abakus',
      key: 'abakus',
      web: 'http://abakus.no/',
      // feed not available, use getNews instead
      logo: './org/abakus/logo.png',
      icon: './org/abakus/icon.png',
      symbol: './org/abakus/symbol.png',
      placeholder: './org/abakus/placeholder.png',
      palette: 'red',
      hw: {
        office: "Abakuskontoret",
        apis: {
          servant: null, // TODO
          meetings: '3ms24h7vpud4clrtt2grtadgm0%40group.calendar.google.com',
        },
        statusIcons: {
          // TODO: update when Abakus gets office status feature
          open: './org/abakus/icon.png', //'./org/abakus/icon-open.png',
          closed: './org/abakus/icon.png', //'./org/abakus/icon-closed.png',
          meeting: './org/abakus/icon.png', //'./org/abakus/icon-meeting.png',
        },
        memePath: './org/abakus/meme/',
      },
      irc: {
        server: 'irc.efnet.org',
        channel: '#abakus',
      },
      // getImages unnecessary, images are extracted from the source code
      getNews: function(posts, callback) {
        if (typeof callback == 'undefined') {
          console.log('ERROR: callback is required');
          return;
        }
        var self = this;
        Ajaxer.getCleanHtml({
          url: self.web,
          success: function(html) {
            var count = 0;
            // Add each item from news tags
            if ($(html).find('.article').length != 0) {
              $(html).find('.article').each( function() {
                if (count < posts.length) {
                  var post = posts[count];

                  // The popular fields
                  post.title = $(this).find("h2").filter(':first').text();
                  post.link = $(this).find("a").filter(':first').attr('href');
                  post.description = $(this).find(".introtext p").filter(':first').text();
                  post.image = $(this).find("pic").filter(':first').attr('src');

                  // Link fixing
                  post.link = 'http://abakus.no' + post.link;
                  // Image fixing
                  if (typeof post.image != 'undefined')
                    post.image = 'http://abakus.no' + post.image;
                  else
                    post.image = self.placeholder;

                  posts[count++] = post;
                }
              });
            }
            else {
              if (self.debug) console.log('ERROR: No articles found at', self.web);
            }
            callback(posts);
          },
          error: function(e) {
            if (self.debug) console.log('ERROR: could not fetch '+self.name+' website');
          },
        });
      },
    },

    'aarhonen': {
      name: 'H.M. Aarhønen',
      key: 'aarhonen',
      web: 'http://www.aarhonen.ntnu.no/',
      feed: 'http://www.aarhonen.ntnu.no/?q=rss.xml',
      logo: './org/aarhonen/logo.png',
      icon: './org/aarhonen/icon.png',
      symbol: './org/aarhonen/symbol.png',
      placeholder: './org/aarhonen/placeholder.png',
      palette: 'purple',
      getImage: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'div.content'});
      },
    },

    'berg': {
      name: 'Bergstuderendes Forening',
      key: 'berg',
      web: 'http://bergstud.no/',
      feed: 'http://bergstud.no/feed/',
      logo: './org/berg/logo.png',
      icon: './org/berg/icon.png',
      symbol: './org/berg/symbol.png',
      placeholder: './org/berg/placeholder.png',
      palette: 'grey',
      getImage: function(link, callback) {
        Images.get(this, link, callback);
      },
    },

    'broderskabet': {
      name: 'Broderskabet',
      key: 'broderskabet',
      web: 'http://broderskabet.no/',
      feed: 'http://broderskabet.no/feed/',
      logo: './org/broderskabet/logo.png',
      icon: './org/broderskabet/icon.png',
      symbol: './org/broderskabet/symbol.png',
      placeholder: './org/broderskabet/placeholder.png',
      palette: 'grey',
      getImages: function(link, callback) {
        Images.get(this, link, callback);
      },
    },

    'delta': {
      name: 'Delta',
      key: 'delta',
      web: 'http://www.deltahouse.no/',
      feed: 'http://www.deltahouse.no/?feed=rss2',
      logo: './org/delta/logo.png',
      icon: './org/delta/icon.png',
      symbol: './org/delta/symbol.png',
      placeholder: './org/delta/placeholder.png',
      palette: 'green',
      hw: {
        office: 'Deltakontoret',
        apis: {
          coffee: 'http://pi.deltahouse.no/coffee.txt',
          light: 'http://pi.deltahouse.no/office.txt',
          servant: null,
          meetings: '34af64urae12lgm98oupqo94gg%40group.calendar.google.com',
        },
        statusIcons: {
          open: './org/delta/icon-open.png',
          closed: './org/delta/icon-closed.png',
          meeting: './org/delta/icon-meeting.png',
        },
        memePath: './org/delta/meme/',
      },
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'emil': {
      name: 'EMIL',
      key: 'emil',
      web: 'http://emilweb.no/',
      feed: 'http://emilweb.no/feed/',
      logo: './org/emil/logo.png',
      icon: './org/emil/icon.png',
      symbol: './org/emil/symbol.png',
      placeholder: './org/emil/placeholder.png',
      palette: 'green',
      getImages: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'div.frontpage'});
      },
    },

    'hc': {
      name: 'Høiskolens Chemikerforening',
      key: 'hc',
      web: 'https://chemie.no/',
      feed: 'https://chemie.no/feed/',
      logo: './org/hc/logo.png',
      icon: './org/hc/icon.png',
      symbol: './org/hc/symbol.png',
      placeholder: './org/hc/placeholder.png',
      palette: 'yellow',
      hw: {
        office: 'HC-kontoret',
        apis: {
          coffee: true,
          light: true,
          servant: 'f2rrhkovg0i2ar1cumaf9aukbs%40group.calendar.google.com',
          meetings: null,
        },
        statusIcons: {
          open: './org/hc/icon-open.png',
          closed: './org/hc/icon-closed.png',
          meeting: './org/hc/icon-meeting.png',
        },
        statusMessages: {
          open: 'Velkommen inn!',
          closed: 'Finn et komitemedlem for å åpne',
          meeting: 'Kontoret er opptatt',
        },
        memePath: './org/hc/meme/',
      },
      // images extracted from feed content
    },

    'hybrida': {
      name: 'Hybrida',
      key: 'hybrida',
      web: 'http://hybrida.no/',
      feed: 'http://hybrida.no/newsfeed/rss',
      logo: './org/hybrida/logo.png',
      icon: './org/hybrida/icon.png',
      symbol: './org/hybrida/symbol.png',
      placeholder: './org/hybrida/placeholder.png',
      palette: 'blue',
      getImage: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'div.headerImage', domainUrl:'hybrida.no'});
      },
    },

    'leonardo': {
      name: 'Leonardo',
      key: 'leonardo',
      web: 'http://industrielldesign.com/',
      feed: 'http://industrielldesign.com/feed',
      logo: './org/leonardo/logo.png',
      icon: './org/leonardo/icon.png',
      symbol: './org/leonardo/symbol.png',
      placeholder: './org/leonardo/placeholder.png',
      palette: 'cyan',
      getImage: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'.content-wrapper', linkDelimiter:'?', imageIndex: 1});
      },
    },

    'mannhullet': {
      name: 'Mannhullet',
      key: 'mannhullet',
      web: 'http://mannhullet.no/',
      // feed: 'http://mannhullet.no/index.php?format=feed&type=rss',
      logo: './org/mannhullet/logo.png',
      icon: './org/mannhullet/icon.png',
      symbol: './org/mannhullet/symbol.png',
      placeholder: './org/mannhullet/placeholder.png',
      palette: 'blue',
      // getImages unnecessary, images are extracted from the source code
      getNews: function(posts, callback) {
        if (typeof callback == 'undefined') {
          console.log('ERROR: callback is required');
          return;
        }
        var self = this;
        Ajaxer.getCleanHtml({
          url: self.web,
          success: function(html) {
            var count = 0;
            // Add each item from news tags
            if ($(html).find('div .post .caption').length != 0) {
              $(html).find('div .post .caption').each( function() {
                if (count < posts.length) {
                  var post = posts[count];

                  // The popular fields
                  post.title = $(this).find("h3 a").filter(':first').text();
                  post.link = $(this).find("p:last a").attr('href');
                  post.description = $(this).find(".introtext p").filter(':first').text();
                  post.image = $(this).find("pic").filter(':first').attr('src');

                  // Link fixing
                  post.link = 'http://mannhullet.no' + post.link;
                  // Image fixing
                  if (typeof post.image != 'undefined')
                    post.image = 'http://mannhullet.no' + post.image;
                  else
                    post.image = self.placeholder;

                  posts[count++] = post;
                }
              });
            }
            else {
              if (self.debug) console.log('ERROR: No articles found at', self.web);
            }
            callback(posts);
          },
          error: function(e) {
            if (self.debug) console.log('ERROR: could not fetch '+self.name+' website');
          },
        });
      },
    },

    'omega': {
      name: 'Omega',
      key: 'omega',
      web: 'http://omega.ntnu.no/',
      // no feed, use getNews
      logo: './org/omega/logo.png',
      icon: './org/omega/icon.png',
      symbol: './org/omega/symbol.png',
      placeholder: './org/omega/placeholder.png',
      palette: 'grey',
      // images also fetched when fetching news
      getNews: function(posts, callback) {
        if (typeof callback == 'undefined') {
          console.log('ERROR: callback is required');
          return;
        }
        var self = this;
        Ajaxer.getCleanHtml({
          url: self.web,
          success: function(html) {
            var count = 0;

            // Add each item from news tags
            if ($(html).find('div.news').length != 0) {
              $(html).find('div.news').each( function() {
                if (count < posts.length) {
                  var post = posts[count];

                  // The popular fields
                  post.title = $(this).find('h5 a').text();
                  post.link = $(this).find('h5 a').attr('href');
                  post.description = $(this).eq(0).find('div:first').text().trim().replace(/\s+/g, ' ');
                  post.author = $(this).next().find('span i').text().trim();
                  post.image = $(this).find('pic').attr('src');

                  // Link fixing
                  post.link = self.web + post.link;

                  // Image fixing
                  if (typeof post.image === 'undefined')
                    post.image = self.placeholder;
                  else
                    post.image = self.web + post.image;

                  posts[count++] = post;
                }
              });
            }
            else {
              if (self.debug) console.log('ERROR: No articles found at', self.web);
            }
            callback(posts);
          },
          error: function(e) {
            if (self.debug) console.log('ERROR: could not fetch '+self.name+' website');
          },
        });
      },
    },

    'online': {
      name: 'Online',
      key: 'online',
      web: 'https://online.ntnu.no',
      logo: './org/online/logo.png',
      icon: './org/online/icon.png',
      symbol: './org/online/symbol.png',
      placeholder: './org/online/placeholder.png',
      sponsor: './org/online/sponsor.png',
      palette: 'online',
      palettePath: './org/online/palette.css',
      useAltLink: true,
      hw: {
        office: 'Onlinekontoret',
        apis: {
          servant: 'b72fgdhuv6g5mpoqa0bdvj095k%40group.calendar.google.com',
          meetings: '54v6g4v6r46qi4asf7lh5j9pcs%40group.calendar.google.com',
        },
        statusIcons: {
          open: './org/online/icon-open.png',
          closed: './org/online/icon-closed.png',
          meeting: './org/online/icon-meeting.png',
        },
        memePath: './org/online/meme/',
      },
      irc: {
        server: 'irc.freenode.net',
        channel: '#online',
      },
      // getImages unnecessary, images are extracted in getNews
      getNews: function(posts, callback) {
        if (typeof callback == 'undefined') {
          console.log('ERROR: callback is required');
          return;
        }
        var self = this;
        Ajaxer.getJson({
          url: 'https://online.ntnu.no/api/v0/article/all/?format=json',
          success: function(json) {
            var count = 0;
            var articles = json.articles;

            if (articles) {
              // Add each article from the API...
              for (var i in articles) {
                var article = articles[i];
                // ...as long as there is more room for posts
                if (count < posts.length) {
                  var post = posts[count];
                  post.title = article.heading;
                  post.link = self.web + article.absolute_url;
                  post.description = article.content;
                  post.creator = article.author.first_name + ' ' + article.author.last_name;
                  post.date = article.created_date;
                  post.image = self.web + article.image_article_front_featured;
                  posts[count++] = post;
                  // Postprocess description to remove markdown stuff (crude method)
                  post.description = post.description.replace(/(####|###|\*\*)/gi, '');
                  post.description = post.description.replace(/\[(.*)\]\(.*\)/gi, '$1');
                }
              }
            }
            else {
              if (self.debug) console.log('ERROR: No articles found at', self.web);
            }
            callback(posts);
          },
          error: function(e) {
            if (self.debug) console.log('ERROR: could not fetch '+self.name+' website');
          },
        });
      },
    },

    'nabla': {
      name: 'Nabla',
      key: 'nabla',
      web: 'http://nabla.no/',
      feed: 'http://nabla.no/feed/',
      logo: './org/nabla/logo.png',
      icon: './org/nabla/icon.png',
      symbol: './org/nabla/symbol.png',
      placeholder: './org/nabla/placeholder.png',
      palette: 'red',
      hw: {
        office: 'Nablakontoret',
        apis: {
          coffee: true,
          light: true,
          meetings: 'eqo138ttshe9r68922ge1708f0%40group.calendar.google.com',
          servant: 'kt7jjv7rtiic9lsg6uq22tmolo%40group.calendar.google.com',
        },
        statusIcons: {
          open: './org/nabla/icon-open.png',
          closed: './org/nabla/icon-closed.png',
          meeting: './org/nabla/icon-meeting.png',
        },
        statusMessages: {
          open: 'Velkommen inn!',
          closed: 'Finn et komitemedlem for å åpne kontoret',
          meeting: 'Det er møte på møterommet',
        },
        memePath: './org/nabla/meme/',
      },
      getImage: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'div.row div.col-md-8', domainUrl:'nabla.no'});
      },
    },

    'placebo': {
      name: 'MF Placebo',
      key: 'placebo',
      web: 'http://mfplacebo.no/',
      feed: 'http://mfplacebo.no/feed/',
      logo: './org/placebo/logo.png',
      icon: './org/placebo/icon.png',
      symbol: './org/placebo/symbol.png',
      placeholder: './org/placebo/placeholder.png',
      palette: 'red',
      getImage: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'article'});
      },
    },

    'solan': {
      name: 'Solan',
      key: 'solan',
      web: 'http://solanlinjeforening.no',
      feed: 'http://www.solanlinjeforening.no/feed/',
      logo: './org/solan/logo.png',
      icon: './org/solan/icon.png',
      symbol: './org/solan/symbol.png',
      placeholder: './org/solan/placeholder.png',
      palette: 'blue',
      hw: {
        office: "Solanstua",
        apis: {
          coffee: true,
          light: true,
          meetings: 'u2ijr3talfkhguigd92o560pq0%40group.calendar.google.com',
          servant: 'qnkokters6lsm9lic2jm0fdfnk%40group.calendar.google.com',
        },
        statusIcons: {
          open: './org/solan/icon-open.png',
          closed: './org/solan/icon-closed.png',
          meeting: './org/solan/icon-meeting.png',
        },
        statusMessages: {
          open: 'Lyset er på ved kaffemaskinen :)',
          closed: 'Det er mørkt ved kaffemaskinen :(',
          meeting: 'Møterommet er opptatt',
        },
        memePath: './org/solan/meme/',
      },
      getImage: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'spanskroeret': {
      name: 'Spanskrøret',
      key: 'spanskroeret',
      web: 'http://spanskroret.no/',
      feed: 'http://spanskroret.no/feed/',
      logo: './org/spanskroeret/logo.png',
      icon: './org/spanskroeret/icon.png',
      symbol: './org/spanskroeret/symbol.png',
      placeholder: './org/spanskroeret/placeholder.png',
      palette: 'green',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'volvox': {
      name: 'Volvox & Alkymisten',
      key: 'volvox',
      web: 'http://volvox.no/',
      feed: 'http://org.ntnu.no/volvox/feed/',
      logo: './org/volvox/logo.png',
      icon: './org/volvox/icon.png',
      symbol: './org/volvox/symbol.png',
      placeholder: './org/volvox/placeholder.png',
      palette: 'green',
      getImage: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    // Linjeforeninger Dragvoll

    'communitas': {
      name: 'Communitas',
      key: 'communitas',
      web: 'http://sosantntnu.wordpress.com/',
      feed: 'http://sosantntnu.wordpress.com/feed/',
      logo: './org/communitas/logo.png',
      icon: './org/communitas/icon.png',
      symbol: './org/communitas/symbol.png',
      placeholder: './org/communitas/placeholder.png',
      palette: 'cyan',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'dhs': {
      name: 'Det Historiske Selskab',
      key: 'dhs',
      web: 'http://ntnuhistorie.wordpress.com/',
      feed: 'http://ntnuhistorie.wordpress.com/feed/',
      logo: './org/dhs/logo.png',
      icon: './org/dhs/icon.png',
      symbol: './org/dhs/symbol.png',
      placeholder: './org/dhs/placeholder.png',
      palette: 'purple',
      getImage: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'dionysos': {
      name: 'Dionysos',
      key: 'dionysos',
      web: 'http://dionysosntnu.wordpress.com/',
      feed: 'http://dionysosntnu.wordpress.com/feed/',
      logo: './org/dionysos/logo.png',
      icon: './org/dionysos/icon.png',
      symbol: './org/dionysos/symbol.png',
      placeholder: './org/dionysos/placeholder.png',
      palette: 'purple',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'erudio': {
      name: 'Erudio',
      key: 'erudio',
      web: 'http://erudiontnu.blogspot.com/',
      feed: 'http://erudiontnu.blogspot.com/feeds/posts/default?alt=rss',
      logo: './org/erudio/logo.png',
      icon: './org/erudio/icon.png',
      symbol: './org/erudio/symbol.png',
      placeholder: './org/erudio/placeholder.png',
      palette: 'red',
      getImage: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'eureka': {
      name: 'Eureka',
      key: 'eureka',
      web: 'http://eurekalf.wordpress.com/',
      feed: 'http://eurekalf.wordpress.com/feed/',
      logo: './org/eureka/logo.png',
      icon: './org/eureka/icon.png',
      symbol: './org/eureka/symbol.png',
      placeholder: './org/eureka/placeholder.png',
      palette: 'blue',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'geolf': {
      name: 'Geolf',
      key: 'geolf',
      web: 'http://geolf.org/',
      feed: 'http://geolf.org/feed/',
      logo: './org/geolf/logo.png',
      icon: './org/geolf/icon.png',
      symbol: './org/geolf/symbol.png',
      placeholder: './org/geolf/placeholder.png',
      palette: 'blue',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'gengangere': {
      name: 'Gengangere',
      key: 'gengangere',
      web: 'http://www.gengangere.no/',
      feed: 'http://www.gengangere.no/feed/',
      logo: './org/gengangere/logo.png',
      icon: './org/gengangere/icon.png',
      symbol: './org/gengangere/symbol.png',
      placeholder: './org/gengangere/placeholder.png',
      palette: 'grey',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'jump_cut': {
      name: 'Jump Cut',
      key: 'jump_cut',
      web: 'http://jumpcutdragvoll.wordpress.com/',
      feed: 'http://jumpcutdragvoll.wordpress.com/feed/',
      logo: './org/jump cut/logo.png',
      icon: './org/jump cut/icon.png',
      symbol: './org/jump cut/symbol.png',
      placeholder: './org/jump cut/placeholder.png',
      palette: 'grey',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'paideia': {
      name: 'Paideia',
      key: 'paideia',
      web: 'http://paideiantnu.wordpress.com/',
      feed: 'http://paideiantnu.wordpress.com/rss',
      logo: './org/paideia/logo.png',
      icon: './org/paideia/icon.png',
      symbol: './org/paideia/symbol.png',
      placeholder: './org/paideia/placeholder.png',
      palette: 'blue',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'panoptikon': {
      name: 'Panoptikon',
      key: 'panoptikon',
      web: 'http://panoptikonlinjeforening.wordpress.com/',
      feed: 'http://panoptikonlinjeforening.wordpress.com/feed/',
      logo: './org/panoptikon/logo.png',
      icon: './org/panoptikon/icon.png',
      symbol: './org/panoptikon/symbol.png',
      placeholder: './org/panoptikon/placeholder.png',
      palette: 'blue',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'pareto': {
      name: 'Pareto',
      key: 'pareto',
      web: 'http://pareto-ntnu.no/',
      feed: 'http://pareto-ntnu.no/?format=feed&type=rss',
      logo: './org/pareto/logo.png',
      icon: './org/pareto/icon.png',
      symbol: './org/pareto/symbol.png',
      placeholder: './org/pareto/placeholder.png',
      palette: 'blue',
      // Images will be found automatically in the HTML of each news post
    },

    'primetime': {
      name: 'Primetime',
      key: 'primetime',
      web: 'http://www.primetime.trondheim.no/',
      feed: 'http://www.primetime.trondheim.no/feed/',
      logo: './org/primetime/logo.png',
      icon: './org/primetime/icon.png',
      symbol: './org/primetime/symbol.png',
      placeholder: './org/primetime/placeholder.png',
      palette: 'cyan',
      getImage: function(link, callback) {
        Images.get(this, link, callback);
      },
    },

    'psi': {
      name: 'Psi',
      key: 'psi',
      web: 'http://psilinjeforening.wordpress.com/',
      feed: 'http://psilinjeforening.wordpress.com/feed/',
      logo: './org/psi/logo.png',
      icon: './org/psi/icon.png',
      symbol: './org/psi/symbol.png',
      placeholder: './org/psi/placeholder.png',
      palette: 'red',
      getImages: function(link, callback) {
        Images.get(this, link, callback);
      },
    },

    'psykolosjen': {
      name: 'Psykolosjen',
      key: 'psykolosjen',
      web: 'http://psykolosjen.no/',
      // no feed, using getNews instead
      logo: './org/psykolosjen/logo.png',
      icon: './org/psykolosjen/icon.png',
      symbol: './org/psykolosjen/symbol.png',
      placeholder: './org/psykolosjen/placeholder.png',
      palette: 'blue',
      // getImages unnecessary, images are extracted from the source code
      getNews: function(posts, callback) {
        if (typeof callback == 'undefined') {
          console.log('ERROR: callback is required');
          return;
        }
        var self = this;
        Ajaxer.getCleanHtml({
          url: self.web,
          success: function(html) {
            var count = 0;

            // Add each item from news tags
            if ($(html).find('#articles').children().length != 0) {
              $(html).find('#articles').children().each( function() {
                if (count < posts.length) {
                  var post = posts[count];

                  // The popular fields
                  post.title = $(this).find('.articleBody h2 a').text();
                  post.link = $(this).find('.articleBody h2 a').prop('href');
                  post.description = $(this).find('.articleBody p:first span').text();
                  post.author = $(this).find('.articleMeta').find('a:first').text();
                  post.image = $(this).find('.articleBody pic').attr('src');

                  if (typeof post.image === 'undefined')
                    post.image = self.placeholder;

                  posts[count++] = post;
                }
              });
            }
            else {
              if (self.debug) console.log('ERROR: No articles found at', self.web);
            }
            callback(posts);
          },
          error: function(e) {
            if (self.debug) console.log('ERROR: could not fetch '+self.name+' website');
          },
        });
      },
    },

    'sturm_und_drang': {
      name: 'Sturm Und Drang',
      key: 'sturm_und_drang',
      web: 'http://www.sturm.ntnu.no/',
      feed: 'http://www.sturm.ntnu.no/wordpress/?feed=rss2',
      logo: './org/sturm und drang/logo.png',
      icon: './org/sturm und drang/icon.png',
      symbol: './org/sturm und drang/symbol.png',
      placeholder: './org/sturm und drang/placeholder.png',
      palette: 'red',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'teaterlosjen': {
      name: 'Teaterlosjen',
      key: 'teaterlosjen',
      web: 'http://teaterlosjen.wordpress.com/',
      feed: 'http://teaterlosjen.wordpress.com/feed/',
      logo: './org/teaterlosjen/logo.png',
      icon: './org/teaterlosjen/icon.png',
      symbol: './org/teaterlosjen/symbol.png',
      placeholder: './org/teaterlosjen/placeholder.png',
      palette: 'red',
      getImage: function(link, callback) {
        Images.get(this, link, callback);
      },
      // TODO: This, alternate feeds per organization
      // altFeeds: {
      //   'Universitetsteatret': 'http://universitetsteatret.wordpress.com/feed/',
      // },
    },
    'universitetsteatret': {
      name: 'Universitetsteatret',
      key: 'universitetsteatret',
      web: 'http://universitetsteatret.wordpress.com',
      feed: 'http://universitetsteatret.wordpress.com/feed/',
      logo: './org/universitetsteatret/logo.png',
      icon: './org/universitetsteatret/icon.png',
      symbol: './org/universitetsteatret/symbol.png',
      placeholder: './org/universitetsteatret/placeholder.png',
      palette: 'blue',
      getImage: function(link, callback) {
        Images.get(this, link, callback);
      },
    },

    'theodor': {
      name: 'Theodor',
      key: 'theodor',
      web: 'http://lftheodor.no/',
      feed: 'http://lftheodor.no/index.php/component/k2/itemlist?format=feed&moduleID=148',
      logo: './org/theodor/logo.png',
      icon: './org/theodor/icon.png',
      symbol: './org/theodor/symbol.png',
      placeholder: './org/theodor/placeholder.png',
      palette: 'red',
      // images extract from feed item description
    },

    // Linjeforeninger HiST/DMMH/TJSF/BI

    'kom': {
      name: 'KOM',
      key: 'kom',
      web: 'http://kjemiogmaterial.wordpress.com/',
      feed: 'http://kjemiogmaterial.wordpress.com/feed/',
      logo: './org/kom/logo.png',
      icon: './org/kom/icon.png',
      symbol: './org/kom/symbol.png',
      placeholder: './org/kom/placeholder.png',
      palette: 'cyan',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'logistikkstudentene': {
      name: 'Logistikkstudentene',
      key: 'logistikkstudentene',
      web: 'http://logistikkstudentene.no/',
      feed: 'http://logistikkstudentene.no/?feed=rss2',
      logo: './org/logistikkstudentene/logo.png',
      icon: './org/logistikkstudentene/icon.png',
      symbol: './org/logistikkstudentene/symbol.png',
      placeholder: './org/logistikkstudentene/placeholder.png',
      palette: 'cyan',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'nutrix': {
      name: 'Nutrix',
      key: 'nutrix',
      web: 'http://nutrix.hist.no/',
      feed: 'http://nutrix.hist.no/?feed=rss2',
      logo: './org/nutrix/logo.png',
      icon: './org/nutrix/icon.png',
      symbol: './org/nutrix/symbol.png',
      placeholder: './org/nutrix/placeholder.png',
      palette: 'green',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'tihlde': {
      name: 'TIHLDE',
      key: 'tihlde',
      web: 'http://tihlde.org/',
      feed: 'http://tihlde.org/feed/',
      logo: './org/tihlde/logo.png',
      icon: './org/tihlde/icon.png',
      symbol: './org/tihlde/symbol.png',
      placeholder: './org/tihlde/placeholder.png',
      palette: 'blue',
      irc: {
        server: 'irc.freenode.net',
        channel: '#tihlde',
      },
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'tim_og_shaenko': {
      name: 'Tim & Shænko',
      key: 'tim_og_shaenko',
      web: 'http://bygging.no/',
      feed: 'http://bygging.no/feed/',
      logo: './org/tim og shaenko/logo.png',
      icon: './org/tim og shaenko/icon.png',
      symbol: './org/tim og shaenko/symbol.png',
      placeholder: './org/tim og shaenko/placeholder.png',
      palette: 'blue',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'tjsf': {
      name: 'TJSF',
      key: 'tjsf',
      web: 'http://tjsf.no/',
      feed: 'http://tjsf.no/feed/',
      logo: './org/tjsf/logo.png',
      icon: './org/tjsf/icon.png',
      symbol: './org/tjsf/symbol.png',
      placeholder: './org/tjsf/placeholder.png',
      palette: 'grey',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'vivas': {
      name: 'Vivas',
      key: 'vivas',
      web: 'http://vivas.hist.no/',
      feed: 'http://vivas.hist.no/?feed=rss2',
      logo: './org/vivas/logo.png',
      icon: './org/vivas/icon.png',
      symbol: './org/vivas/symbol.png',
      placeholder: './org/vivas/placeholder.png',
      palette: 'cyan',
      getImages: function(links, callback) {
        Images.get(this, links, callback, {newsSelector:'.post'});
      },
    },

    // Masterforeninger, doktorforeninger, internasjonale foreninger

    'dion': {
      name: 'DION',
      key: 'dion',
      web: 'http://www.dion.ntnu.no/',
      feed: 'http://www.dion.ntnu.no/en_US/feeds/news-en_US/',
      logo: './org/dion/logo.png',
      icon: './org/dion/icon.png',
      symbol: './org/dion/symbol.png',
      placeholder: './org/dion/placeholder.png',
      palette: 'cyan',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'esn': {
      name: 'ESN',
      key: 'esn',
      web: 'http://www.trondheim.esn.no/',
      feed: 'http://www.trondheim.esn.no/rss.xml',
      logo: './org/esn/logo.png',
      icon: './org/esn/icon.png',
      symbol: './org/esn/symbol.png',
      placeholder: './org/esn/placeholder.png',
      palette: 'cyan',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'iaeste': {
      name: 'IAESTE',
      key: 'iaeste',
      web: 'http://iaeste.no/',
      feed: 'http://iaeste.no/wp/?feed=rss2',
      logo: './org/iaeste/logo.png',
      icon: './org/iaeste/icon.png',
      symbol: './org/iaeste/symbol.png',
      placeholder: './org/iaeste/placeholder.png',
      palette: 'blue',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'isu': {
      name: 'International Student Union',
      key: 'isu',
      web: 'http://org.ntnu.no/isu/',
      feed: 'http://org.ntnu.no/isu/feed/',
      logo: './org/isu/logo.png',
      icon: './org/isu/icon.png',
      symbol: './org/isu/symbol.png',
      placeholder: './org/isu/placeholder.png',
      palette: 'blue',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'projeksjon': {
      name: 'Projeksjon',
      key: 'projeksjon',
      web: 'http://projeksjon.no/',
      feed: 'http://projeksjon.no/feed/',
      logo: './org/projeksjon/logo.png',
      icon: './org/projeksjon/icon.png',
      symbol: './org/projeksjon/symbol.png',
      placeholder: './org/projeksjon/placeholder.png',
      palette: 'blue',
      getImage: function(link, callback) {
        Images.get(this, link, callback);
      },
    },

    'signifikant': {
      name: 'Signifikant',
      key: 'signifikant',
      web: 'http://org.ntnu.no/signifikant/',
      feed: 'http://org.ntnu.no/signifikant/?q=rss.xml',
      logo: './org/signifikant/logo.png',
      icon: './org/signifikant/icon.png',
      symbol: './org/signifikant/symbol.png',
      placeholder: './org/signifikant/placeholder.png',
      palette: 'cyan',
      getImage: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'div.content', domainUrl:'org.ntnu.no'});
      },
    },

    'soma': {
      name: 'SOMA',
      key: 'soma',
      web: 'http://somantnu.blogspot.com/',
      feed: 'http://somantnu.blogspot.com/feeds/posts/default',
      logo: './org/soma/logo.png',
      icon: './org/soma/icon.png',
      symbol: './org/soma/symbol.png',
      placeholder: './org/soma/placeholder.png',
      palette: 'cyan',
      // getImages unnecessary, images are extracted from HTML in entries
    },

    'symbiosis': {
      name: 'Symbiosis',
      key: 'symbiosis',
      web: 'http://www.ntnusymbiosis.com/',
      feed: 'http://www.ntnusymbiosis.com/feed/',
      logo: './org/symbiosis/logo.png',
      icon: './org/symbiosis/icon.png',
      symbol: './org/symbiosis/symbol.png',
      placeholder: './org/symbiosis/placeholder.png',
      palette: 'green',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    // Studentmedier

    'dusken': {
      name: 'Dusken.no',
      key: 'dusken',
      web: 'http://dusken.no/',
      feed: 'http://dusken.no/feed/',
      logo: './org/dusken/logo.png',
      icon: './org/dusken/icon.png',
      symbol: './org/dusken/symbol.png',
      placeholder: './org/dusken/placeholder.png',
      palette: 'grey',
      // Using getImage instead because Dusken posts the article to the RSS feed before the frontpage.
      getImage: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'div.col-xs-12', domainUrl:'dusken.no'});
      },
    },

    'universitetsavisa': {
      name: 'Universitetsavisa',
      key: 'universitetsavisa',
      web: 'http://www.universitetsavisa.no/',
      feed: 'http://www.universitetsavisa.no/?widgetName=polarisFeeds&widgetId=40853&getXmlFeed=true',
      logo: './org/universitetsavisa/logo.png',
      icon: './org/universitetsavisa/icon.png',
      symbol: './org/universitetsavisa/symbol.png',
      placeholder: './org/universitetsavisa/placeholder.png',
      palette: 'cyan',
      // getImages unnecessary, Universitetsavisa uses <enclosure>-tag for images
    },

    'gemini': {
      name: 'Gemini',
      key: 'gemini',
      web: 'http://gemini.no/',
      feed: 'http://gemini.no/feed/',
      logo: './org/gemini/logo.png',
      icon: './org/gemini/icon.png',
      symbol: './org/gemini/symbol.png',
      placeholder: './org/gemini/placeholder.png',
      palette: 'cyan',
      getImage: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'header.entry-header'});
      },
    },

    'adressa': {
      name: 'Adressa Student',
      key: 'adressa',
      web: 'http://adressa.no/',
      feed: 'http://www.adressa.no/student/?widgetName=polarisFeeds&widgetId=3185248&getXmlFeed=true',
      logo: './org/adressa/logo.png',
      icon: './org/adressa/icon.png',
      symbol: './org/adressa/symbol.png',
      placeholder: './org/adressa/placeholder.png',
      palette: 'blue',
      getImage: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'div.image.top'});
      },
    },

    // Store studentorganisasjoner

    'samfundet': {
      name: 'Studentersamfundet',
      key: 'samfundet',
      web: 'http://www.samfundet.no/',
      feed: 'http://www.samfundet.no/arrangement/rss',
      logo: './org/samfundet/logo.png',
      icon: './org/samfundet/icon.png',
      symbol: './org/samfundet/symbol.png',
      placeholder: './org/samfundet/placeholder.png',
      palette: 'red',
      // getImages unnecessary, Samfundet uses <link>-tag for images
    },

    // Studentdemokrati

    'velferdstinget': {
      name: 'Velferdstinget',
      key: 'velferdstinget',
      web: 'http://www.velferdstinget.no/',
      feed: 'http://www.velferdstinget.no/feed/rss/',
      logo: './org/velferdstinget/logo.png',
      icon: './org/velferdstinget/icon.png',
      symbol: './org/velferdstinget/symbol.png',
      placeholder: './org/velferdstinget/placeholder.png',
      palette: 'cyan',
      getImage: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'#innhold'});
      },
    },

    'studenttinget_ntnu': {
      name: 'Studenttinget NTNU',
      key: 'studenttinget_ntnu',
      web: 'http://www.studenttinget.no/',
      feed: 'http://www.studenttinget.no/feed/',
      logo: './org/studenttinget ntnu/logo.png',
      icon: './org/studenttinget ntnu/icon.png',
      symbol: './org/studenttinget ntnu/symbol.png',
      placeholder: './org/studenttinget ntnu/placeholder.png',
      palette: 'purple',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    'studentparlamentet_hist': {
      name: 'Studentparlamentet HiST',
      key: 'studentparlamentet_hist',
      web: 'http://studentparlamentet.com/',
      feed: 'http://studentparlamentet.com/?feed=rss2',
      logo: './org/studentparlamentet hist/logo.png',
      icon: './org/studentparlamentet hist/icon.png',
      symbol: './org/studentparlamentet hist/symbol.png',
      placeholder: './org/studentparlamentet hist/placeholder.png',
      palette: 'blue',
      getImages: function(links, callback) {
        Images.get(this, links, callback);
      },
    },

    // Institusjoner

    'ntnu': {
      name: 'NTNU',
      key: 'ntnu',
      web: 'http://ntnu.no/',
      feed: 'https://www.retriever-info.com/feed/2002900/generell_arkiv166/index.xml',
      logo: './org/ntnu/logo.png',
      icon: './org/ntnu/icon.png',
      symbol: './org/ntnu/symbol.png',
      placeholder: './org/ntnu/placeholder.png',
      palette: 'blue',
      getImage: function(link, callback) {
        if (link.indexOf('adressa.no') !== -1) {
          Images.get(this, link, callback, {newsSelector:'div.media'});
        }
        else if (link.indexOf('bygg.no') !== -1) {
          Images.get(this, link, callback, {newsSelector:'div#article'});
        }
        else if (link.indexOf('byggfakta.no') !== -1 || link.indexOf('byggaktuelt.no') !== -1) {
          Images.get(this, link, callback, {newsSelector:'div.body-content'});
        }
        else if (link.indexOf('dn.no') !== -1) {
          Images.get(this, link, callback, {newsSelector:'figure', domainUrl:'www.dn.no'});
        }
        else if (link.indexOf('dusken.no') !== -1) {
          Images.get(this, link, callback, {newsSelector:'div.span10', domainUrl:'dusken.no'});
        }
        else if (link.indexOf('forskningsradet.no') !== -1) {
          Images.get(this, link, callback, {newsSelector:'article', domainUrl:'www.forskningsradet.no'});
        }
        else if (link.indexOf('npolar.no') !== -1) {
          Images.get(this, link, callback, {newsSelector:'div.paragraph', domainUrl:'www.npolar.no'});
        }
        else if (link.indexOf('nrk.no') !== -1) {
          Images.get(this, link, callback, {newsSelector:'figure', noscriptMatching:/src="(http:\/\/gfx.nrk.no\/\/.*)"/});
        }
        else if (link.indexOf('regjeringen.no') !== -1) {
          Images.get(this, link, callback, {newsSelector:'div.imagecontainer', domainUrl:'regjeringen.no'});
        }
        else if (link.indexOf('stfk.no') !== -1) {
          Images.get(this, link, callback, {newsSelector:'div.documentbody', domainUrl:'www.stfk.no'});
        }
        else if (link.indexOf('trondheim.kommune.no') !== -1) {
          Images.get(this, link, callback, {domainUrl:'www.trondheim.kommune.no'});
        }
        else if (link.indexOf('tu.no') !== -1) {
          Images.get(this, link, callback, {newsSelector:'div#topImage'});
        }
        else if (link.indexOf('utdanningsnytt.no') !== -1) {
          Images.get(this, link, callback, {newsSelector:'div#hovedartikkelContainer', domainUrl:'utdanningsnytt.no'});
        }
        else {
          // Just try something, might work!
          Images.get(this, link, callback);
        }
      },
    },

    'rektoratet_ntnu': {
      name: 'Rektoratet NTNU',
      key: 'rektoratet_ntnu',
      web: 'http://www.ntnu.no/blogger/rektoratet/',
      feed: 'http://www.ntnu.no/blogger/rektoratet/feed/',
      logo: './org/rektoratet ntnu/logo.png',
      icon: './org/rektoratet ntnu/icon.png',
      symbol: './org/rektoratet ntnu/symbol.png',
      placeholder: './org/rektoratet ntnu/placeholder.png',
      palette: 'blue',
      getImage: function(link, callback) {
        Images.get(this, link, callback, {newsSelector:'div.entry'});
      },
    },

    'hist': {
      name: 'HiST',
      key: 'hist',
      web: 'http://hist.no/',
      feed: 'http://hist.no/rss.ap?thisId=1393',
      logo: './org/hist/logo.png',
      icon: './org/hist/icon.png',
      symbol: './org/hist/symbol.png',
      placeholder: './org/hist/placeholder.png',
      palette: 'blue',
      getImages: function(links, callback) {
        Images.get(this, links, callback, {newsSelector:'div.nyhet', domainUrl:'hist.no'});
      },
    },

    'dmmh': {
      name: 'DMMH',
      key: 'dmmh',
      web: 'http://www.dmmh.no/',
      feed: 'http://dmmh.no/hva-skjer?rss=true',
      logo: './org/dmmh/logo.png',
      icon: './org/dmmh/icon.png',
      symbol: './org/dmmh/symbol.png',
      placeholder: './org/dmmh/placeholder.png',
      palette: 'red',
      getImage: function(link, callback) {
        Images.get(this, link, callback, {domainUrl:'dmmh.no'});
      },
    },

  },

  // Affiliations above
  // Functions below

  getMemeCount: function(affiliation) {
    if (Affiliation.org[affiliation].hw.memePath) {
      var counter = 1;
      var path = Affiliation.org[affiliation].hw.memePath;
      while (urlExists(path+counter+'.jpg')) {
        counter++;
      }
      return counter - 1; // because we initialize to 1, not 0
    }
    else {
      console.log('ERROR: affiliation', affiliation, 'does not have a memepath');
      return 0;
    }
  },
  hasHardware: function(affiliation) {
    return Affiliation.org[affiliation] !== undefined && Affiliation.org[affiliation].hw !== undefined;
  },
  hasLegacyLight: function(affiliation) {
    // TODO: Make this check less shit
    if(this.hasHardware(affiliation)) {
      // True means notipi
      if(Affiliation.org[affiliation].hw.apis.light === true) {
        return false;
      }
      // Set to something else than true
      return Affiliation.org[affiliation].hw.apis.light !== undefined;
    }
    return false;
  },
  hasLegacyCoffee: function(affiliation) {
    // TODO: Make this check less shit
    if(this.hasHardware(affiliation)) {
      // True means notipi
      if(Affiliation.org[affiliation].hw.apis.coffee === true) {
        return false;
      }
      // Set to something else than true
      return Affiliation.org[affiliation].hw.apis.coffee !== undefined;
    }
    return false;
  }
};

module.exports = Affiliation;
