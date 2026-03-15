function middle(req, res, next) {
  //validazione titolo
  if (req.body?.title) {
    const { title } = req.body;
    if (typeof title != "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "Non hai inserito un titolo corretto",
      });
    }
  }

  //validazione content
  if (req.body?.content) {
    const { content } = req.body;
    if (!content.trim() || typeof content != "string") {
      return res.status(400).json({
        success: false,
        error: "Non hai inserito un contenuto corretto",
      });
    }
  }
  //validazione image
  if (req.body?.image) {
    const { image } = req.body;
    if (!image.trim() || typeof image != "string") {
      return res.status(400).json({
        success: false,
        error: "Non hai inserito un immagine corretta",
      });
    }
  }

  //validazione tags
  if (req.body?.tags) {
    const { tags } = req.body;
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Non hai inserito tag",
      });
    }
    for (const el of tags) {
      if (!el.trim()) {
        return res.status(400).json({
          success: false,
          error: "Inserisci dei tag validi",
        });
      }
    }
  }
  next();
}

module.exports = middle;
