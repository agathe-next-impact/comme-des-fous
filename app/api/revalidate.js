export default async function handler(req, res) 
{
    if (req.query.secret !== process.env.MY_SECRET_TOKEN) {    
        return res.status(401).json({ message: 'Token invalide' });  }
          try {    
            const pathToRevalidate = req.query.path;        
            if (!pathToRevalidate) {      
                return res.status(400).json({ message: 'Le paramètre path est requis' });    }    
                 await res.revalidate(pathToRevalidate);        
                 return res.json({ revalidated: true });  } 
                 catch (err) {    
                    return res.status(500).send('Erreur lors de la revalidation');  
                
                }
}