function middle(req, res, next) {
  const { title, content, image, tags } = req.body;

  //validazione titolo
  if (typeof title != "string" || !title.trim()) {
    return res.status(400).json({
      success: false,
      error: "Non hai inserito un titolo corretto",
    });
  }
  //validazione content
  if (!content.trim() || typeof content != "string") {
    return res.status(400).json({
      success: false,
      error: "Non hai inserito un contenuto corretto",
    });
  }
  //validazione image
  if (!image.trim() || typeof image != "string") {
    return res.status(400).json({
      success: false,
      error: "Non hai inserito un immagine corretta",
    });
  }

  //validazione tags
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
  next();
}

module.exports = middle;
