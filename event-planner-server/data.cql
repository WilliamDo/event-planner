MATCH (n) DETACH DELETE n

CREATE (cloud:Person { name: "Cloud", image: "cloud_avatar1.jpg" })
CREATE (barret:Person { name: "Barret", image: "barret_avatar3.jpg" })
CREATE (aerith:Person { name: "Aerith", image: "aerith_avatar3.jpg" })
CREATE (tifa:Person { name: "Tifa", image: "tifa_avatar3.jpg" })
CREATE (cloud)-[:FRIEND]->(barret)
CREATE (cloud)-[:FRIEND]->(aerith)
CREATE (cloud)-[:FRIEND]->(tifa)
CREATE (cloud)-[:ORGANISE]->(:Event {title: "Chocobo Racing", start: 1625331600, end: 1625335200})