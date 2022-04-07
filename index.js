const express = require('express')

const app = express()
const port = 5000

const db = require('./connection/db')

app.set('view engine', 'hbs')   // set view engine hbs
app.use('/public', express.static(__dirname + '/public'))    // set public path/folder
app.use(express.urlencoded({ extended: false }))    // encode / conver


app.get('/', function (req, res) {
    db.connect(function (err, client, done) {
        if (err) throw err  // untuk menampilkan error koneksi database

        let query = `SELECT * FROM tb_projects`
        client.query(query, function (err, result) {
            if (err) throw err  // untuk menampilkan error query

            // console.log(result.rows);
            let data = result.rows

            data = data.map(function (item) {
                return {
                    ...item,
                    title: item.name,
                    startDate: getFullTime(item.start_date),
                    endDate: getFullTime(item.end_date),
                    duration: durationBlog(item.start_date, item.end_date),
                    description: item.description.slice(0, 150) + '...',
                    //icon dan gambar
                    reactjs: checkboxes(item.technologies[0]),
                    nodejs: checkboxes(item.technologies[1]),
                    javascript: checkboxes(item.technologies[2]),
                    java: checkboxes(item.technologies[3]),
                    image: item.image,
                    id: item.id
                }
            })
            res.render('index', { blogs: data })
        })
    })

})

app.get('/add-project', function (req, res) {
    res.render('add-project')
})

// ADD PROJECT
app.post('/add-project', function (req, res) {
    let data = req.body

    let query = `INSERT INTO tb_projects (name, start_date, end_date, description, technologies, image) VALUES ('${data.inputProjectName}','${data.startDate}','${data.endDate}','${data.inputDescription}','{"${data.reactjs}","${data.nodejs}","${data.javascript}","${data.java}"}','${data.inputImage}')`
    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(query, function (err, result) {
            if (err) throw err
            done()
            res.redirect('/')
        })
    })
})

app.get('/contact-me', function (req, res) {
    res.render('contact')
})

app.get('/register', function (req, res) {
    res.render('register')
})

app.post('/register', function (req, res) {
    let data = req.body
    console.log(req.body);

})

app.get('/login', function (req, res) {
    res.render('login')
})

app.get('/project-detail/:id', function (req, res) {
    let id = req.params.id

    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(`SELECT * FROM tb_projects WHERE id = ${id}`, function (err, result) {
            if (err) throw err
            let data = result.rows[0]
            done()

            // console.log(result.rows[0]);
            data = {
                name: data.name,
                start_date: getFullTime(data.start_date),
                end_date: getFullTime(data.end_date),
                duration: durationBlog(data.start_date, data.end_date),
                description: data.description,
                reactjs: checkboxes(data.technologies[0]),
                nodejs: checkboxes(data.technologies[1]),
                javascript: checkboxes(data.technologies[2]),
                java: checkboxes(data.technologies[3]),
                image: data.image
            }
            res.render('project-detail', { detail: data })
        })
    })
})

app.get('/edit-project/:id', function (req, res) {
    let id = req.params.id

    db.connect(function (err, client, done) {
        if (err) throw err

        let query = `SELECT * FROM tb_projects WHERE id = ${id}`
        client.query(query, function (err, result) {
            if (err) throw err
            done()

            let data = result.rows[0];
            console.log('ini log result.rows');
            console.log(result.rows[0]);
            // let technologies = [];
            // technologies.push = data.reactjs
            data = {
                name: data.name,
                start_date: getFullTime(data.start_date),
                end_date: getFullTime(data.end_date),
                description: data.description,
                reactjs: checkboxes(data.technologies[0]),
                nodejs: checkboxes(data.technologies[1]),
                javascript: checkboxes(data.technologies[2]),
                java: checkboxes(data.technologies[3]),
                image: data.image
            }
            res.render('edit-project', { edit: data, id })
        })
    })
})

app.post('/update-project/:id', function (req, res) {
    let data = req.body
    let id = req.params.id

    data = {
        name: data.inputProjectName,
        start_date: data.startDate,
        end_date: data.endDate,
        description: data.inputDescription,
        reactjs: checkboxes(data.reactjs),
        nodejs: checkboxes(data.nodejs),
        javascript: checkboxes(data.javascript),
        java: checkboxes(data.java),
        image: data.image
    }

    let query = `UPDATE public.tb_projects SET name='${data.name}', start_date='${data.start_date}', end_date='${data.end_date}', description='${data.description}', technologies='{"${data.reactjs}","${data.nodejs}","${data.javascript}","${data.java}"}', image='${data.image}' WHERE id = ${id}`

    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(query, function (err, result) {
            if (err) throw err
            done()
            res.redirect('/')
        })
    })
})

app.get('/delete-blog/:id', function (req, res) {
    const id = req.params.id
    const query = `DELETE FROM tb_projects WHERE id=${id};`
    console.log(query);

    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(query, function (err, result) {
            if (err) throw err
            done()

            res.redirect('/')
        })
    })
})


// Function duration
function durationBlog(startDate, endDate) {

    let start = new Date(startDate)
    let end = new Date(endDate)

    let duration = end.getTime() - start.getTime()

    let miliseconds = 1000 // 1000 miliseconds dalam 1 detik
    let secondInHours = 3600 // 1 jam sama dengan 3600 detik
    let hoursInDay = 24 // 24 jam dalam 1 hari

    let distanceDay = Math.floor(duration / (miliseconds * secondInHours * hoursInDay))
    let distanceWeek = Math.floor(distanceDay / 7)
    let distanceMonth = Math.floor(distanceDay / 30)

    if (distanceMonth > 0) {
        return `${distanceMonth} bulan`
    } else if (distanceWeek > 0) {
        return `${distanceWeek} minggu`
    } else if (distanceDay > 0) {
        return `${distanceDay} hari`
    }
}

function getFullTime(waktu) {

    let month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'December']

    let date = waktu.getDate().toString().padStart(2, "0")
    // console.log(date);

    let monthIndex = (waktu.getMonth() + 1).toString().padStart(2, "0")
    // console.log(month[monthIndex]);

    let year = waktu.getFullYear()
    // console.log(year);

    let hours = waktu.getHours()
    let minutes = waktu.getMinutes()

    let dateTime = `${year}-${monthIndex}-${date}`

    let fullTime = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`

    return dateTime
}

// Function checkbox
function checkboxes(condition) {
    if (condition === 'on' || condition === 'true') {
        return true
    } else {
        return false
    }
}

function checkboxes2(condition) {
    if (typeof condition === undefined || condition === "undefined") {
        return false
    } else {
        return true
    }
}


app.listen(port, function (req, res) {
    console.log(`server listen on port ${port}`);
}) 