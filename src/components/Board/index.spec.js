import React from 'react'
import { render, within, act, fireEvent } from 'react-testing-library'
import Board from './'
import { callbacks } from 'react-beautiful-dnd'

describe('<Board />', () => {
  let subject, onCardDragEnd, onLaneDragEnd
  const board = {
    lanes: [
      {
        id: 1,
        title: 'Lane Backlog',
        cards: [
          {
            id: 1,
            title: 'Card title',
            description: 'Card content'
          },
          {
            id: 2,
            title: 'Card title',
            description: 'Card content'
          }
        ]
      },
      {
        id: 2,
        title: 'Lane Doing',
        cards: [
          {
            id: 3,
            title: 'Card title',
            description: 'Card content'
          }
        ]
      }
    ]
  }

  function mount ({ children = board, ...otherProps } = {}) {
    subject = render(<Board {...otherProps}>{children}</Board>)
    return subject
  }
  afterEach(() => { subject = onCardDragEnd = onLaneDragEnd = undefined })

  it('renders a board', () => {
    expect(mount().container.querySelector('div')).toBeInTheDocument()
  })

  it('renders the specified lanes in the board ordered by its specified position', () => {
    const lanes = mount().queryAllByText(/^Lane/)
    expect(lanes).toHaveLength(2)
    expect(lanes[0]).toHaveTextContent(/^Lane Backlog$/)
    expect(lanes[1]).toHaveTextContent(/^Lane Doing$/)
  })

  it('renders the specified cards in their lanes', () => {
    expect(within(mount().queryByText(/^Lane Backlog$/).parentNode.parentNode).queryAllByText(/^Card title$/)).toHaveLength(2)
  })

  describe('about the card moving', () => {
    describe('when the component receives "onCardDragEnd" callback', () => {
      beforeEach(() => {
        onCardDragEnd = jest.fn()
        mount({ onCardDragEnd })
      })

      describe('when the user cancels the card moving', () => {
        beforeEach(() => { callbacks.onDragEnd({ source: null, destination: null }) })

        it('does not call onCardDragEnd callback', () => {
          expect(onCardDragEnd).not.toHaveBeenCalled()
        })
      })

      describe('when the user moves a card to another position', () => {
        beforeEach(() => {
          act(() => {
            callbacks.onDragEnd({ source: { droppableId: '1', index: 0 }, destination: { droppableId: '1', index: 1 } })
          })
        })

        it('calls the onCardDragEnd callback passing the modified board and the card move coordinates', () => {
          const expectedBoard = {
            lanes: [
              {
                id: 1,
                title: 'Lane Backlog',
                cards: [
                  {
                    id: 2,
                    title: 'Card title',
                    description: 'Card content'
                  },
                  {
                    id: 1,
                    title: 'Card title',
                    description: 'Card content'
                  }
                ]
              },
              {
                id: 2,
                title: 'Lane Doing',
                cards: [
                  {
                    id: 3,
                    title: 'Card title',
                    description: 'Card content'
                  }
                ]
              }
            ]
          }
          expect(onCardDragEnd).toHaveBeenCalledTimes(1)
          expect(onCardDragEnd).toHaveBeenCalledWith(expectedBoard, { laneId: 1, index: 0 }, { laneId: 1, index: 1 })
        })
      })
    })
  })

  describe('about the lane moving', () => {
    describe('when the component receives "onLaneDragEnd" callback', () => {
      beforeEach(() => {
        onLaneDragEnd = jest.fn()
        mount({ onLaneDragEnd })
      })

      describe('when the user cancels the lane moving', () => {
        beforeEach(() => { callbacks.onDragEnd({ source: null, destination: null, type: 'BOARD' }) })

        it('does not call onLaneDragEnd callback', () => {
          expect(onLaneDragEnd).not.toHaveBeenCalled()
        })
      })

      describe('when the user moves a lane to another position', () => {
        beforeEach(() => {
          act(() => {
            callbacks.onDragEnd({ source: { index: 0 }, destination: { index: 1 }, type: 'BOARD' })
          })
        })

        it('calls the onLaneDragEnd callback passing the modified board and the lane move coordinates', () => {
          const expectedBoard = {
            lanes: [
              {
                id: 2,
                title: 'Lane Doing',
                cards: [
                  {
                    id: 3,
                    title: 'Card title',
                    description: 'Card content'
                  }
                ]
              },
              {
                id: 1,
                title: 'Lane Backlog',
                cards: [
                  {
                    id: 1,
                    title: 'Card title',
                    description: 'Card content'
                  },
                  {
                    id: 2,
                    title: 'Card title',
                    description: 'Card content'
                  }
                ]
              }
            ]
          }

          expect(onLaneDragEnd).toHaveBeenCalledTimes(1)
          expect(onLaneDragEnd).toHaveBeenCalledWith(expectedBoard, { index: 0 }, { index: 1 })
        })
      })
    })
  })

  describe("about the board's custom card", () => {
    let renderCard
    const board = {
      lanes: [
        {
          id: 1,
          title: 'Lane Backlog',
          cards: [
            {
              id: 1,
              title: 'Card title',
              content: 'Card content'
            },
            {
              id: 2,
              title: 'Card title',
              content: 'Card content'
            }
          ]
        },
        {
          id: 2,
          title: 'Lane Doing',
          cards: [
            {
              id: 3,
              title: 'Card title',
              content: 'Card content'
            }
          ]
        }
      ]
    }

    afterEach(() => { renderCard = undefined })

    describe('when it receives a "renderCard" prop', () => {
      beforeEach(() => {
        renderCard = jest.fn(cardContent => (
          <div>{cardContent.id} - {cardContent.title} - {cardContent.content}</div>
        ))

        mount({ children: board, renderCard })
      })

      it("renders the custom cards on the board's lane", () => {
        expect(subject.queryAllByTestId('card')).toHaveLength(3)
        expect(subject.queryByTestId('card')).toHaveTextContent(/^1 - Card title - Card content$/)
      })

      it('passes the card content and the isDragging as a parameter to the renderCard prop', () => {
        expect(renderCard).toHaveBeenCalledTimes(3)
        expect(renderCard).toHaveBeenNthCalledWith(1, { id: 1, title: 'Card title', content: 'Card content' }, false)
      })
    })
  })

  describe("about the lane's custom header", () => {
    let renderLaneHeader
    const board = {
      lanes: [
        {
          id: 1,
          title: 'Lane Backlog',
          wip: 1,
          cards: [{ id: 2, title: 'Card title', content: 'Card content' }]
        }
      ]
    }

    afterEach(() => { renderLaneHeader = undefined })

    describe('when it receives a "renderLaneHeader" prop', () => {
      beforeEach(() => {
        renderLaneHeader = jest.fn(laneContent => (
          <div>{laneContent.title} ({laneContent.wip})</div>
        ))

        mount({ children: board, renderLaneHeader })
      })

      it("renders the custom header on the board's lane", () => {
        expect(subject.queryAllByTestId('lane-header')).toHaveLength(1)
        expect(subject.queryByTestId('lane-header')).toHaveTextContent(/^Lane Backlog \(1\)$/)
      })

      it('passes the lane content to the renderLaneHeader prop', () => {
        expect(renderLaneHeader).toHaveBeenCalledTimes(1)
        expect(renderLaneHeader).toHaveBeenCalledWith({
          id: 1,
          title: 'Lane Backlog',
          wip: 1,
          cards: [{ id: 2, title: 'Card title', content: 'Card content' }]
        })
      })
    })
  })

  describe('about the lane adding', () => {
    describe('when it receives the "allowAddLane" and "onNewLane" prop', () => {
      let onNewLane

      beforeEach(() => {
        onNewLane = jest.fn(lane => ({ id: 999, ...lane }))
        mount({ allowAddLane: true, onNewLane })
      })
      afterEach(() => { onNewLane = undefined })

      it('renders the lane placeholder as the last lane to add a new lane', () => {
        expect(subject.queryByText('➕')).toBeInTheDocument()
      })

      describe('when the user clicks to add a new lane', () => {
        beforeEach(() => fireEvent.click(subject.queryByText('➕')))

        it('hides the lane placeholder', () => {
          expect(subject.queryByText('➕')).not.toBeInTheDocument()
        })

        it('renders the input asking for a lane title', () => {
          expect(subject.container.querySelector('input')).toBeInTheDocument()
        })

        describe('when the user confirms the new lane', () => {
          beforeEach(() => {
            fireEvent.change(subject.container.querySelector('input'), { target: { value: 'Lane Added by user' } })
            fireEvent.click(subject.queryByText('Add'))
          })

          it('calls the "onNewLane" passing the new lane', () => {
            expect(onNewLane).toHaveBeenCalledTimes(1)
            expect(onNewLane).toHaveBeenCalledWith({ title: 'Lane Added by user', cards: [] })
          })

          it('renders the new lane using the id returned on "onNewLane"', () => {
            expect(subject.queryAllByTestId('lane')).toHaveLength(3)
          })

          it('renders the lane placeholder as the last lane to add a new lane', () => {
            expect(subject.queryByText('➕')).toBeInTheDocument()
          })
        })

        describe('when the user cancels the new lane adding', () => {
          beforeEach(() => {
            fireEvent.click(subject.queryByText('Cancel'))
          })

          it('does not add any new lane', () => {
            expect(subject.queryAllByTestId('lane')).toHaveLength(2)
          })

          it('renders the lane placeholder as the last lane to add a new lane', () => {
            expect(subject.queryByText('➕')).toBeInTheDocument()
          })
        })
      })
    })
  })
})
