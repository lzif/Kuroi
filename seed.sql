
        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:champignon-no-majo',
          'champignon-no-majo',
          'Champignon no Majo',
          185514,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/image-2-4.jpg',
          'Episode 11',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:omae-gotoki-ga-maou-ni-kateru-to-omouna',
          'omae-gotoki-ga-maou-ni-kateru-to-omouna',
          'Omae Gotoki ga Maou ni Kateru to Omouna',
          191718,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/Omae-Gotoki-ga-Maou-ni-Kateru-to-Omouna-Episode-10.jpg',
          'Episode 10',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:jujutsu-kaisen-season-3',
          'jujutsu-kaisen-season-3',
          'Jujutsu Kaisen Season 3',
          172463,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/image-7.jpg',
          'Episode 10',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:mato-seihei-no-slave-season-2',
          'mato-seihei-no-slave-season-2',
          'Mato Seihei no Slave Season 2',
          176276,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/Mato-Seihei-no-Slave-Season-2-Episode-10.jpg',
          'Episode 10',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:yuusha-kei-ni-shosu-choubatsu-yuusha-9004-tai-keimu-kiroku',
          'yuusha-kei-ni-shosu-choubatsu-yuusha-9004-tai-keimu-kiroku',
          'Yuusha-kei ni Shosu: Choubatsu Yuusha 9004-tai Keimu Kiroku',
          167152,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/Sentenced.To_.Be_.a.Hero_.S01E10.jpg',
          'Episode 10',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:jigoku-sensei-nube-2025-part-2',
          'jigoku-sensei-nube-2025-part-2',
          'Jigoku Sensei Nube (2025) Part 2',
          191967,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/Jigoku-Sensei-Nube-Part-2-Episode-10.jpg',
          'Episode 10',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:tamon-kun-ima-docchi',
          'tamon-kun-ima-docchi',
          'Tamon-kun Ima Docchi!?',
          178005,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/web-9.jpg',
          'Episode 11',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:oshi-no-ko-season-3',
          'oshi-no-ko-season-3',
          'Oshi no Ko Season 3',
          182587,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/web-8.jpg',
          'Episode 9',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:odayaka-kizoku-no-kyuuka-no-susume',
          'odayaka-kizoku-no-kyuuka-no-susume',
          'Odayaka Kizoku no Kyuuka no Susume',
          182771,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/Odayaka-Kizoku-no-Kyuuka-no-Susume-Episode-10.jpg',
          'Episode 10',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:yuusha-party-wo-oidasareta-kiyou-bimbou',
          'yuusha-party-wo-oidasareta-kiyou-bimbou',
          'Yuusha Party wo Oidasareta Kiyou Bimbou',
          187264,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/image-10.jpg',
          'Episode 11',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:shibouyugi',
          'shibouyugi',
          'Shibouyugi',
          180746,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/image-8.jpg',
          'Episode 10',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:okiraku-ryoushu-no-tanoshii-ryouchi-bouei',
          'okiraku-ryoushu-no-tanoshii-ryouchi-bouei',
          'Okiraku Ryoushu no Tanoshii Ryouchi Bouei',
          191205,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/Okiraku-Ryoushu-no-Tanoshii-Ryouchi-Bouei-Episode-10.jpg',
          'Episode 10',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:29-sai-dokushin-chuuken-boukensha-no-nichijou',
          '29-sai-dokushin-chuuken-boukensha-no-nichijou',
          '29-sai Dokushin Chuuken Boukensha no Nichijou',
          192261,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/29-sai-Dokushin-Chuuken-Boukensha-Episode-10.jpg',
          'Episode 10',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:yuukawa',
          'yuukawa',
          'Yuukawa',
          195515,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/image-6-1.jpg',
          'Episode 10',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:darwin-jihen',
          'darwin-jihen',
          'Darwin Jihen',
          177679,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/web-7.jpg',
          'Episode 10',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      

        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          'samehadakuv2:golden-kamuy-final-season',
          'golden-kamuy-final-season',
          'Golden Kamuy Final Season',
          166521,
          'https://v2.samehadaku.how/wp-content/uploads/2026/03/Golden-Kamuy-Final-Season-Episode-10.jpg',
          'Episode 10',
          'SamehadakuV2'
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      