"use client";

import React, { useState, useEffect } from "react";
import { getBooks } from "../../api/endpoints";
import authorize from "../../api/auth";
import Table from "../_components/Table";

const Dashboard = () => {
  const [initialRenderComplete, setInitialRenderComplete] = useState(false);
  const [books, setBooks] = useState([]);

  const fetchBooks = async () => {
    try {
      const response = await getBooks();

      const objectProperties = ["title", "author", "published", "description"];
      const rearrangedBooks = response
        .map((book) => {
          const rearrangedBook = {};
          objectProperties.forEach((prop) => {
            rearrangedBook[prop] = book[prop];
          });
          return rearrangedBook;
        })
        .sort((a, b) => {
          return a.title.toUpperCase().localeCompare(b.title.toUpperCase());
        });

      setBooks(rearrangedBooks);
    } catch (error) {}
  };

  useEffect(() => {
    fetchBooks();
    setInitialRenderComplete(true);
  }, []);

  if (!initialRenderComplete) {
    return <></>;
  } else {
    return (
      <React.Fragment>
        <div className="flex justify-between items-end py-2">
          <h1 className="text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl">
            Books
          </h1>
          <p className="text-xl tracking-tight leading-none text-gray-900">
            {books?.length} {books?.length === 1 ? "book" : "books"}
          </p>
        </div>
        <Table
          headers={["Title", "Author", "Year", "Description"]}
          mobileHeaders={["Title", "Author", "Year"]}
          data={books}
          actions
          desiredColumnWidths={[2, 2, 1, 4, 2]} // Only for desktop
        />
      </React.Fragment>
    );
  }
};

export default authorize(Dashboard);
