exports.get404Page = (req, res, next) => {
                        // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
                        res.status(404).render('404', {docTitle: 'Page Not Found', path: '/404', isAuthenticated: req.session.isLoggedIn});
                    }


exports.get500Page = (req, res, next) => {
    res.status(500).render('500', 
                    {
                        docTitle: 'Error Occured!', 
                        path: '/500', 
                        isAuthenticated: req.session.isLoggedIn
                    });
}