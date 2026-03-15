const connection = require("../db/connections");

function index(req, res) {
  const sql = "select * from posts";

  connection.query(sql, (err, resultsBlog) => {
    if (err)
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    res.json({
      success: true,
      results: resultsBlog,
    });
  });
}

function show(req, res) {
  const id = req.params.id;
  const sql = "select * from posts where id=?";

  connection.query(sql, [id], (err, resultsBlog) => {
    if (err)
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    if (resultsBlog.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Id not found",
      });
    }

    const sqlTag =
      "select p.title,t.label from posts as p inner join post_tag as pt on p.id=pt.post_id inner join tags as t on t.id=pt.tag_id where p.id=?";
    connection.query(sqlTag, [id], (err, resultTags) => {
      if (err)
        return res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      const tags = resultTags.reduce((ac, { label }) => {
        ac.push(label);
        return ac;
      }, []);

      resultsBlog[0].tags = [...tags];
      res.json({
        success: true,
        results: resultsBlog,
      });
    });
  });
}

async function store(req, res) {
  const { title, content, image, tags } = req.body;
  const validateTitle = (tit) => {
    const tmpTitle = tit.toLowerCase();
    return tmpTitle.charAt(0).toUpperCase() + tmpTitle.slice(1);
  };

  //query
  try {
    //Verifico se il titolo è gia presente
    const sqlTitle = "select title from posts where title=?";
    const [resultsTitle] = await connection.promise().query(sqlTitle, [title]);
    if (resultsTitle.length > 0) {
      return res.json({
        success: false,
        error: "Titolo gia esistente",
      });
    }
    //se il titolo non è presente vado ad inserire i 3 campi in posts
    const sqlInsert = "insert into posts (title,content,image) values (?,?,?) ";
    const validTitle = validateTitle(title);
    const [resultsInsert] = await connection
      .promise()
      .query(sqlInsert, [validTitle, content, image]);

    //ora devo gestire i tags
    //verifico se sono da inserire e scarto quelli gia esistenti
    //se presenti recupero gli id
    const tagsIds = [];
    const tagsDaInserire = [];
    for (const el of tags) {
      const sqlQuery = "select * from tags where label=?";
      const [resultQuery] = await connection.promise().query(sqlQuery, [el]);
      if (resultQuery.length === 0) {
        tagsDaInserire.push(el);
      } else {
        tagsIds.push(resultQuery[0].id);
      }
    }

    //vado ad inserire i tags nel db
    //recupero id con insertId
    for (const el of tagsDaInserire) {
      const sqlInsertTag = "insert into tags (label) values(?)";
      const [resultInstag] = await connection
        .promise()
        .query(sqlInsertTag, [el]);
      tagsIds.push(resultInstag.insertId);
    }

    //ora devo collegare i dati nella tabella pivot
    //devo recuperare id del posts e ogni id dei tags

    //posso recuperare id post tramite insertId!
    const idPost = resultsInsert.insertId;
    //posso recupare in questo modo anche quelli dei tag?
    //yes ma mi servono gli id già presenti se ce ne sono
    //ok posso recuperli quando verifico se esistono

    //elimino eventuali id doppi
    const tagsUni = [...new Set(tagsIds)];
    //vado a fare insert nella table pivot
    for (const el of tagsUni) {
      const sqlTmp = "insert into post_tag (post_id,tag_id) values(?,?)";
      const [resultsUltimo] = await connection
        .promise()
        .query(sqlTmp, [idPost, el]);
    }

    res.json({
      success: true,
      message: "Inserito!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

async function update(req, res) {
  const { title, content, image, tags } = req.body;
  const id = req.params.id;

  const validateTitle = (tit) => {
    const tmpTitle = tit.toLowerCase();
    return tmpTitle.charAt(0).toUpperCase() + tmpTitle.slice(1);
  };

  const titleToInsert = validateTitle(title);

  try {
    //NON devo verificare se il titolo è gia presente
    //Verifico ID
    const sql = "select * from posts where id=?";
    const [resultsId] = await connection.promise().query(sql, [id]);
    if (resultsId.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Id not found",
      });
    }

    //faccio update table posts
    //gestisco i tags
    //aggiorno table pivot
    const sqlUpdate = "update posts set title=?,content=?,image=? where id=?";
    const [resultUpdate] = await connection
      .promise()
      .query(sqlUpdate, [titleToInsert, content, image, id]);

    //come gestisco i tags?
    //ricontrollo i doppioni, aggiungo quelli nuovi

    const tagIds = [];
    const tasgDaIns = [];
    for (const el of tags) {
      const sqlQuery = "select * from tags where label=?";
      const [resultQuery] = await connection.promise().query(sqlQuery, [el]);
      if (resultQuery.length === 0) {
        tasgDaIns.push(el);
      } else {
        tagIds.push(resultQuery[0].id);
      }
    }

    for (const el of tasgDaIns) {
      const sqlInsertTag = "insert into tags (label) values(?)";
      const [resultInstag] = await connection
        .promise()
        .query(sqlInsertTag, [el]);
      tagIds.push(resultInstag.insertId);
    }

    const tagsUni = [...new Set(tagIds)];
    console.log(tagsUni);

    //devo eliminare prima le vecchie relazioni
    await connection
      .promise()
      .query("delete from post_tag where post_id=?", [id]);

    //ora inserisco le nuove relazioni
    for (const el of tagsUni) {
      const sqlTmp = "insert into post_tag (post_id,tag_id) values(?,?)";
      await connection.promise().query(sqlTmp, [id, el]);
    }

    res.json({
      success: true,
      message: "Update!",
    });
    //
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

async function modify(req, res) {
  const id = req.params.id;
  const validateTitle = (tit) => {
    const tmpTitle = tit.toLowerCase();
    return tmpTitle.charAt(0).toUpperCase() + tmpTitle.slice(1);
  };

  try {
    //title è da modificare? se presente lo modifico
    if (req.body?.title) {
      const newTitle = validateTitle(req.body.title);
      const sqlTitle = "update posts set title=? where id=?";
      await connection.promise().query(sqlTitle, [newTitle, id]);
    }
    //come title
    if (req.body?.content) {
      const sqlContent = "update posts set content=? where id=?";
      await connection.promise().query(sqlContent, [req.body.content, id]);
    }
    //come title
    if (req.body?.image) {
      const sqlImage = "update posts set image=? where id=?";
      await connection.promise().query(sqlImage, [req.body.image, id]);
    }

    //tags?
    if (req.body?.tags) {
      const { tags } = req.body;
      const tagIds = [];
      const tasgDaIns = [];
      for (const el of tags) {
        const sqlQuery = "select * from tags where label=?";
        const [resultQuery] = await connection.promise().query(sqlQuery, [el]);
        if (resultQuery.length === 0) {
          tasgDaIns.push(el);
        } else {
          tagIds.push(resultQuery[0].id);
        }
      }

      for (const el of tasgDaIns) {
        const sqlInsertTag = "insert into tags (label) values(?)";
        const [resultInstag] = await connection
          .promise()
          .query(sqlInsertTag, [el]);
        tagIds.push(resultInstag.insertId);
      }

      const tagsUni = [...new Set(tagIds)];
      console.log(tagsUni);

      //devo eliminare prima le vecchie relazioni
      await connection
        .promise()
        .query("delete from post_tag where post_id=?", [id]);

      //ora inserisco le nuove relazioni
      for (const el of tagsUni) {
        const sqlTmp = "insert into post_tag (post_id,tag_id) values(?,?)";
        await connection.promise().query(sqlTmp, [id, el]);
      }
    }

    res.json({
      succes: true,
      message: "Modify!",
    });
  } catch (err) {}
}

function destroy(req, res) {
  const id = req.params.id;
  const sql = "delete from posts where id=?";

  connection.query(sql, [id], (err, resultsDel) => {
    if (err)
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });

    if (resultsDel.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Id not found",
      });
    }

    res.status(204);
  });
}

module.exports = { index, show, store, update, modify, destroy };
